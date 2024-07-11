import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';

import { generateAndSubmitForm } from '../../data/utils';

ensureConfig(['ECOMMERCE_BASE_URL'], 'Alipay API service');

/**
 * Checkout with Alipay
 *
 * 1. Send the basket_id and payment_processor to our /api/v2/checkout/
 * 2. Receive a Alipay url
 * 3. Generate an submit an empty form to the Alipay url
 */
export default async function checkout(basket) {
  const { basketId } = basket;

  const formData = {
    basket_id: basketId,
    payment_processor: 'alipay',
  };
  if (basket.discountJwt) {
    formData.discount_jwt = basket.discountJwt;
  }

  const { data } = await getAuthenticatedHttpClient()
    .post(`${getConfig().ECOMMERCE_BASE_URL}/api/v2/checkout/`, formData)
    .catch((error) => {
      logError(error, {
        messagePrefix: 'Alipay Checkout Error',
        paymentMethod: 'Alipay',
        paymentErrorType: 'Checkout',
        basketId,
      });

      throw error;
    });

  generateAndSubmitForm(data.payment_page_url);
}
