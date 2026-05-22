<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useStore } from "vuex";
import { errorHandler, createError, ERROR_CODES } from "./common/errorHandler.js";

const store = useStore();

onLaunch(() => {
  initCloud();
  initGlobalErrorHandler();
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});

function initCloud() {
  if (wx.cloud) {
    wx.cloud.init({
      env: "cloud1-8gqlw6ybf6a7f13e",
      traceUser: true
    });
    checkLogin();
  }
}

async function checkLogin() {
  try {
    const res = await wx.cloud.callFunction({
      name: "getOpenId"
    });
    if (res.result.code === 0) {
      store.commit("SET_USER_INFO", res.result.data);
      store.commit("SET_SHOP_INFO", res.result.shopInfo);
    }
  } catch (e: any) {
    const error = createError(ERROR_CODES.NETWORK_ERROR, e.message || "登录失败");
    errorHandler.captureError(error, { action: 'checkLogin' });
    console.error("登录失败:", e);
  }
}

function initGlobalErrorHandler() {
  const originalError = console.error;
  console.error = function(...args: any[]) {
    originalError.apply(console, args);
    
    try {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      const error = createError(ERROR_CODES.BUSINESS_ERROR, message);
      errorHandler.captureError(error, { action: 'console.error' });
    } catch (e) {
      originalError('Error handler error:', e);
    }
  };

  const originalReject = Promise.prototype.then;
  Promise.prototype.then = function(onFulfilled, onRejected) {
    return originalReject.call(this, onFulfilled, (reason: any) => {
      if (reason && (reason instanceof Error || reason.message)) {
        const error = createError(ERROR_CODES.BUSINESS_ERROR, reason.message || 'Promise rejected');
        errorHandler.captureError(error, { action: 'Promise.reject' });
      }
      if (onRejected) {
        return onRejected(reason);
      }
      throw reason;
    });
  };
}
</script>

<style lang="scss">
@import "./common/styles/common.scss";

page {
  background-color: $bg-color;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif;
  font-size: $font-size-base;
  color: $text-color;
}

view, text, image, button, input, textarea {
  box-sizing: border-box;
}

button {
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  font-size: inherit;
  line-height: inherit;

  &::after {
    border: none;
  }
}

image {
  display: block;
}

.safe-area-bottom {
  padding-bottom: $safe-bottom;
  padding-bottom: $safe-bottom-env;
}
</style>