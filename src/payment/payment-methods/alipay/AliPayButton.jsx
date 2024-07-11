import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import AliPayLogo from './assets/alipay-logo.png';
import messages from './AliPayButton.messages';

const AliPayButton = ({ intl, isProcessing, ...props }) => (
  <button type="button" {...props}>
    { isProcessing ? <span className="button-spinner-icon text-primary mr-2" /> : null }
    <img
      src={AliPayLogo}
      alt={intl.formatMessage(messages['payment.type.alipay'])}
    />
  </button>
);

AliPayButton.propTypes = {
  intl: intlShape.isRequired,
  isProcessing: PropTypes.bool,
};

AliPayButton.defaultProps = {
  isProcessing: false,
};

export default injectIntl(AliPayButton);
