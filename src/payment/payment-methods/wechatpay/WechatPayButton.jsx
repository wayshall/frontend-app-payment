import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import WechatPayLogo from './assets/wechatpay-logo.png';
import messages from './WechatPayButton.messages';

const WechatPayButton = ({ intl, isProcessing, ...props }) => (
  <button type="button" {...props}>
    { isProcessing ? <span className="button-spinner-icon text-primary mr-2" /> : null }
    <img
      src={WechatPayLogo}
      alt={intl.formatMessage(messages['payment.type.wechatpay'])}
    />
  </button>
);

WechatPayButton.propTypes = {
  intl: intlShape.isRequired,
  isProcessing: PropTypes.bool,
};

WechatPayButton.defaultProps = {
  isProcessing: false,
};

export default injectIntl(WechatPayButton);
