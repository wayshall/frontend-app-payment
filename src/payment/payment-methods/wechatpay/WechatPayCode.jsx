import { injectIntl } from '@edx/frontend-platform/i18n';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';
import PropTypes from 'prop-types';
import { wechatPayQrcodeGenerated } from '../../data/actions';
import WechatPayLogo2 from './assets/wechatpay-logo2.png';

const WechatPayCode = ({ value, tradeState }) => {
//   console.log('WechatPayCode tradeState: ', tradeState)
  if (value) {
    if (tradeState === 'USERPAYING') {
      return (
        <div>正在支付……</div>
      );
    }

    if (tradeState === 'NOTPAY') {
      return (
        <div>
          <div>请扫描下面的二维码进行支付……</div>
          <div>
            <QRCode
              value={value}// 生成二维码的内容
              size={300} // 二维码的大小
              fgColor="#000000" // 二维码的颜色
              imageSettings={{ // 中间有图片logo
                src: WechatPayLogo2,
                width: 72,
                height: 60,
                excavate: true,
              }}
            />
          </div>
        </div>
      );
    }

    if (tradeState === 'SUCCESS') {
      return (
        <div>支付成功，请在跳转，请等待……</div>
      );
    }

    return (
      <div>正在完成支付，请等待……</div>
    );
  }

  return (
    <div>正在请求微信支付，请等待……</div>
  );
};

WechatPayCode.propTypes = {
  value: PropTypes.string,
  tradeState: PropTypes.string,
};
WechatPayCode.defaultProps = {
  value: null,
  tradeState: null,
};
// export default injectIntl(WechatPayCode)
export default connect(null, { wechatPayQrcodeGenerated })(injectIntl(WechatPayCode));
