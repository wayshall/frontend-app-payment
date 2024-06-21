import { combineReducers } from 'redux';

import {
  // PULL_WECHAT_PAY_RESULT,
  WECHAT_PAY_QRCODE_GENERATED,
  WECHAT_PAY_STATE,
  BASKET_DATA_RECEIVED,
  BASKET_PROCESSING,
  CAPTURE_KEY_DATA_RECEIVED,
  CAPTURE_KEY_PROCESSING,
  CLIENT_SECRET_DATA_RECEIVED,
  CLIENT_SECRET_PROCESSING,
  MICROFORM_STATUS,
  fetchBasket,
  submitPayment,
  fetchCaptureKey,
  fetchClientSecret,
} from './actions';

import { DEFAULT_STATUS } from '../checkout/payment-form/flex-microform/constants';

const basketInitialState = {
  loading: true,
  loaded: false,
  submitting: false,
  redirect: false,
  isBasketProcessing: false,
  products: [],
  wechatPayQrcodeUrl: null,
  wechatPayTradeState: null,
};

const basket = (state = basketInitialState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case fetchBasket.TRIGGER: return { ...state, loading: true };
      case fetchBasket.FULFILL: return {
        ...state,
        loading: false,
        loaded: true,
      };

      case BASKET_DATA_RECEIVED: return { ...state, ...action.payload };

      case BASKET_PROCESSING: return {
        ...state,
        isBasketProcessing: action.payload,
      };

      case WECHAT_PAY_QRCODE_GENERATED: return {
        ...state,
        wechatPayQrcodeUrl: action.payload.payment_page_url,

      };

      case WECHAT_PAY_STATE: return {
        ...state,
        wechatPayTradeState: action.payload.trade_state,

      };

      case submitPayment.TRIGGER: return {
        ...state,
        paymentMethod: action.payload.method,
      };
      case submitPayment.REQUEST: return {
        ...state,
        submitting: true,
      };
      case submitPayment.SUCCESS: return {
        ...state,
        redirect: true,
      };
      case submitPayment.FULFILL: return {
        ...state,
        submitting: true,
        // paymentMethod: undefined,
      };

      default:
    }
  }
  return state;
};

const captureContextInitialState = {
  isCaptureKeyProcessing: false,
  microformStatus: DEFAULT_STATUS,
  captureKeyId: '',
};

const captureKey = (state = captureContextInitialState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case fetchCaptureKey.TRIGGER: return state;
      case fetchCaptureKey.FULFILL: return state;

      case CAPTURE_KEY_DATA_RECEIVED: return { ...state, ...action.payload };

      case CAPTURE_KEY_PROCESSING: return {
        ...state,
        isCaptureKeyProcessing: action.payload,
      };

      case MICROFORM_STATUS: return {
        ...state,
        microformStatus: action.payload,
      };

      default:
    }
  }
  return state;
};

const clientSecretInitialState = {
  isClientSecretProcessing: false,
  clientSecretId: '',
};

const clientSecret = (state = clientSecretInitialState, action = null) => {
  if (action != null) {
    switch (action.type) {
      case fetchClientSecret.TRIGGER: return state;
      case fetchClientSecret.FULFILL: return state;
      case CLIENT_SECRET_DATA_RECEIVED: return { ...state, ...action.payload };
      case CLIENT_SECRET_PROCESSING: return { ...state, isClientSecretProcessing: action.payload };

      default:
    }
  }
  return state;
};

const reducer = combineReducers({
  basket,
  captureKey,
  clientSecret,
});

export default reducer;
