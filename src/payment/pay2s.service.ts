import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class Pay2sService {
  private readonly logger = new Logger(Pay2sService.name);

  private get isSandbox() {
    return process.env.PAY2S_IS_SANDBOX === 'true';
  }

  private get partnerCode() {
    return this.isSandbox ? process.env.PAY2S_SANDBOX_PARTNER_CODE : process.env.PAY2S_PARTNER_CODE;
  }

  private get accessKey() {
    return this.isSandbox ? process.env.PAY2S_SANDBOX_ACCESS_KEY : process.env.PAY2S_ACCESS_KEY;
  }

  private get secretKey() {
    return this.isSandbox ? process.env.PAY2S_SANDBOX_SECRET_KEY : process.env.PAY2S_SECRET_KEY;
  }

  private get apiUrl() {
    return this.isSandbox
      ? 'https://sandbox-payment.pay2s.vn/v1/gateway/api/create'
      : 'https://payment.pay2s.vn/v1/gateway/api/create';
  }

  private get returnUrl() {
    return process.env.PAY2S_RETURN_URL || 'http://localhost:3000/payment/result';
  }

  private get ipnUrl() {
    return process.env.PAY2S_IPN_URL || '';
  }

  private get bankAccounts(): Array<{ account_number: string; bank_id: string }> {
    const raw = process.env.PAY2S_BANK_ACCOUNTS || '';
    if (!raw) return [];
    return raw.split(',').map((entry) => {
      const [account_number, bank_id] = entry.trim().split('|');
      return { account_number: account_number?.trim(), bank_id: bank_id?.trim() };
    });
  }

  async createPaymentLink(orderNumber: string, amount: number): Promise<string | null> {
    if (!this.partnerCode || !this.accessKey || !this.secretKey) {
      this.logger.warn('Thiếu cấu hình Pay2S. Bỏ qua tạo link thanh toán.');
      return null;
    }

    const requestId = orderNumber;
    const orderId = orderNumber;
    // orderInfo: chỉ gồm chữ/số, không có khoảng trắng/dấu, 10–32 ký tự
    const orderInfo = 'thanhtoandonhang';
    const requestType = 'pay2s';
    const redirectUrl = this.returnUrl;
    const ipnUrl = this.ipnUrl;

    // Chữ ký theo đúng chuẩn docs Pay2S:
    // thứ tự alphabet, bankAccounts dùng literal string "Array"
    const rawSignature = [
      `accessKey=${this.accessKey}`,
      `amount=${amount}`,
      `bankAccounts=Array`,
      `ipnUrl=${ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${this.partnerCode}`,
      `redirectUrl=${redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join('&');

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const body = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      partnerName: process.env.PAY2S_PARTNER_NAME || 'SeaShop',
      requestId,
      amount,
      orderId,
      orderInfo,
      orderType: requestType,
      bankAccounts: this.bankAccounts,
      redirectUrl,
      ipnUrl,
      requestType,
      signature,
    };

    this.logger.debug(`Pay2S rawSignature: ${rawSignature}`);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(body),
      });

      const data = await response.json() as any;
      this.logger.log(`Pay2S response: ${JSON.stringify(data)}`);

      // resultCode === 0 là thành công, payUrl là link redirect
      if (data.resultCode === 0 && data.payUrl) {
        return data.payUrl;
      }

      this.logger.error(`Lỗi từ Pay2S: ${data.message}`);

      // Sandbox fallback: redirect thẳng về result page để test flow FE
      if (this.isSandbox) {
        this.logger.log('Fallback sang Sandbox Mock URL');
        return `${this.returnUrl}?orderNumber=${orderNumber}&mock_pay2s=true&status=success`;
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Lỗi gọi API Pay2S: ${error.message}`);
      if (this.isSandbox) {
        return `${this.returnUrl}?orderNumber=${orderNumber}&mock_pay2s=true&status=success`;
      }
      return null;
    }
  }

  verifyWebhookSignature(data: any, signature: string): boolean {
    if (!this.secretKey) return false;
    // Webhook signature: sắp xếp key alphabet, bỏ qua field 'signature'
    const keys = Object.keys(data).filter((k) => k !== 'signature').sort();
    const rawHash = keys.map((k) => `${k}=${data[k]}`).join('&');
    const expected = crypto.createHmac('sha256', this.secretKey).update(rawHash).digest('hex');
    return expected === signature;
  }
}
