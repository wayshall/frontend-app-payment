import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { delay, call, put } from 'redux-saga/effects';
import { wechatPayState } from '../../data/actions';

ensureConfig(['ECOMMERCE_BASE_URL'], 'WechatPay API service');

export async function queryWechatPayResult(basket, checkoutResult) {
  // console.log('query payment basket: ', basket);
  // console.log('query payment checkoutResult: ', checkoutResult);
  const { basketId } = basket;
  const params = {
    basket_id: basketId,
    out_trade_no: checkoutResult.payment_form_data.out_trade_no,
  };
  // console.log('query payment params: ', params);
  const payResult = await getAuthenticatedHttpClient()
    .get(`${getConfig().ECOMMERCE_BASE_URL}/payment/wechatpay/query/`, {
      params,
    })
    .then(res => res)
    .catch((error) => {
      // console.log('wechat pay query error: ', error);
      logError(error, {
        messagePrefix: 'WechatPay Checkout Error',
        paymentMethod: 'WechatPay',
        paymentErrorType: 'Checkout',
        basketId,
      });
    });

  return payResult;
}

export function* queryPayment(basket, checkoutResult) {
  // console.log('query payment basket1: ', basket);
  // 设置最大重试次数
  const maxRetries = -1;
  let retries = 0;

  while (maxRetries === -1 || retries < maxRetries) {
    // 发送请求检查支付状态
    const response = yield call(queryWechatPayResult, basket, checkoutResult);
    const paymentStatus = response.data;
    // console.log('query payment paymentStatus: ', paymentStatus);

    // 根据支付状态决定是否继续轮询
    if (paymentStatus.trade_state === 'SUCCESS') {
      // 支付成功，结束轮询
      // console.log('query payment success, redirect: ', paymentStatus.redirect_url);
      window.location.href = paymentStatus.redirect_url;
      break;
    } else {
      // console.log('query payment delay...');
      yield put(wechatPayState(paymentStatus));
      // 支付未成功，等待一段时间后再次检查
      yield delay(2000); // 等待5秒
      retries++;
    }
  }
}

/**
 * Checkout with PayPal
 *
 * 1. Send the basket_id and payment_processor to our /api/v2/checkout/
 * 2. Receive a paypal url
 * 3. Generate an submit an empty form to the paypal url
 */
export default async function checkout(basket) {
  const { basketId } = basket;

  // console.log('paymentArgs: ', paymentArgs);

  const formData = {
    basket_id: basketId,
    payment_processor: 'wechatpay',
  };
  if (basket.discountJwt) {
    formData.discount_jwt = basket.discountJwt;
  }

  // if (paymentArgs && paymentArgs.updateQrcode) {
  //   // paymentArgs.updateQrcode('testurl')
  // }

  const { data } = await getAuthenticatedHttpClient()
    .post(`${getConfig().ECOMMERCE_BASE_URL}/api/v2/checkout/`, formData)
    .then(res => res)
    .catch((error) => {
      // console.log('wechat pay error: ', error);
      logError(error, {
        messagePrefix: 'WechatPay Checkout Error',
        paymentMethod: 'WechatPay',
        paymentErrorType: 'Checkout',
        basketId,
      });

      throw error;
    });

  // // generateAndSubmitForm(data.payment_page_url);
  return data;
  // return "www.163.com"
}
