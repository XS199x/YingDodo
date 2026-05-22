<template>
  <view class="page-container">
    <view class="form-section">
      <view class="form-card card">
        <text class="form-title">商品图片</text>
        <view class="image-upload" @click="chooseImage">
          <image v-if="productImage" :src="productImage" mode="aspectFill" />
          <view v-else class="upload-placeholder">
            <text class="upload-icon">📷</text>
            <text class="upload-text">点击拍照或从相册选择</text>
          </view>
        </view>
      </view>

      <view class="form-card card">
        <text class="form-title">商品信息</text>
        
        <view class="form-item">
          <text class="form-label">商品名称</text>
          <input 
            class="form-input" 
            v-model="productName" 
            placeholder="输入商品名称"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="form-label">商品分类</text>
          <view class="category-select" @click="showCategoryPicker = true">
            <text>{{ selectedCategory || '请选择分类' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">售价</text>
          <view class="price-input-wrap">
            <text class="price-symbol">¥</text>
            <input 
              class="form-input price-input" 
              v-model="price" 
              type="digit"
              placeholder="0.00"
            />
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">原价（可选）</text>
          <view class="price-input-wrap">
            <text class="price-symbol">¥</text>
            <input 
              class="form-input price-input" 
              v-model="originalPrice" 
              type="digit"
              placeholder="原价"
            />
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">库存</text>
          <view class="stock-input-wrap">
            <view class="stock-btn" @click="decreaseStock">-</view>
            <input 
              class="form-input stock-input" 
              v-model="stock" 
              type="number"
              placeholder="0"
            />
            <view class="stock-btn" @click="increaseStock">+</view>
          </view>
        </view>
      </view>

      <view class="form-card card">
        <text class="form-title">商品标签</text>
        <view class="tags-area">
          <view 
            v-for="tag in presetTags" 
            :key="tag" 
            class="tag-item"
            :class="{ selected: selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >{{ tag }}</view>
        </view>
        <view class="custom-tag">
          <input 
            class="tag-input" 
            v-model="customTag" 
            placeholder="自定义标签"
            maxlength="10"
            @confirm="addCustomTag"
          />
          <button class="btn-sm btn-outline" @click="addCustomTag">添加</button>
        </view>
      </view>

      <view class="form-card card">
        <text class="form-title">商品描述</text>
        <textarea 
          class="form-textarea" 
          v-model="description" 
          placeholder="简单描述商品特点..."
          maxlength="200"
        />
      </view>
    </view>

    <view class="submit-section">
      <button class="btn-primary submit-btn" @click="saveProduct">
        <text>{{ isEdit ? '保存修改' : '发布商品' }}</text>
      </button>
    </view>

    <view v-if="showCategoryPicker" class="modal-overlay" @click="showCategoryPicker = false">
      <view class="picker-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择分类</text>
          <text class="modal-close" @click="showCategoryPicker = false">✕</text>
        </view>
        <view class="picker-content">
          <view 
            v-for="cat in categories" 
            :key="cat" 
            class="picker-item"
            :class="{ selected: selectedCategory === cat }"
            @click="selectCategory(cat)"
          >{{ cat }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const productImage = ref('')
    const productName = ref('')
    const selectedCategory = ref('')
    const price = ref('')
    const originalPrice = ref('')
    const stock = ref(10)
    const selectedTags = ref([])
    const customTag = ref('')
    const description = ref('')
    const showCategoryPicker = ref(false)
    const isEdit = ref(false)

    const categories = ['水果', '零食', '饮料', '日用品', '生鲜', '熟食', '其他']
    const presetTags = ['热销', '新品', '今日特价', '限量', '推荐']

    const chooseImage = () => {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          productImage.value = res.tempFilePaths[0]
        }
      })
    }

    const toggleTag = (tag) => {
      const index = selectedTags.value.indexOf(tag)
      if (index > -1) {
        selectedTags.value.splice(index, 1)
      } else {
        selectedTags.value.push(tag)
      }
    }

    const addCustomTag = () => {
      if (customTag.value && !selectedTags.value.includes(customTag.value)) {
        selectedTags.value.push(customTag.value)
        customTag.value = ''
      }
    }

    const decreaseStock = () => {
      if (stock.value > 0) {
        stock.value--
      }
    }

    const increaseStock = () => {
      stock.value++
    }

    const selectCategory = (cat) => {
      selectedCategory.value = cat
      showCategoryPicker.value = false
    }

    const saveProduct = () => {
      if (!productName.value) {
        uni.showToast({ title: '请输入商品名称', icon: 'none' })
        return
      }
      if (!selectedCategory.value) {
        uni.showToast({ title: '请选择分类', icon: 'none' })
        return
      }
      if (!price.value) {
        uni.showToast({ title: '请输入售价', icon: 'none' })
        return
      }

      uni.showLoading({ title: '保存中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: isEdit.value ? '修改成功' : '发布成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }, 1000)
    }

    onLoad((options) => {
      if (options?.id) {
        isEdit.value = true
        productName.value = '新疆哈密瓜'
        selectedCategory.value = '水果'
        price.value = '20'
        originalPrice.value = '28'
        stock.value = 30
        selectedTags.value = ['今日特价']
      }
    })

    return {
      productImage,
      productName,
      selectedCategory,
      price,
      originalPrice,
      stock,
      selectedTags,
      customTag,
      description,
      showCategoryPicker,
      isEdit,
      categories,
      presetTags,
      chooseImage,
      toggleTag,
      addCustomTag,
      decreaseStock,
      increaseStock,
      selectCategory,
      saveProduct
    }
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  padding: 20rpx;
}

.form-card {
  margin-bottom: 20rpx;
  padding: 24rpx;

  .form-title {
    display: block;
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 20rpx;
  }
}

.image-upload {
  width: 100%;
  height: 300rpx;
  background: $bg-color;
  border-radius: $radius-lg;
  overflow: hidden;

  image {
    width: 100%;
    height: 100%;
  }

  .upload-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .upload-icon {
      font-size: 64rpx;
      margin-bottom: 12rpx;
    }

    .upload-text {
      font-size: $font-size-sm;
      color: $text-light;
    }
  }
}

.form-item {
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .form-label {
    display: block;
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: 12rpx;
  }

  .form-input {
    width: 100%;
    height: 80rpx;
    background: $bg-color;
    border-radius: $radius-sm;
    padding: 0 20rpx;
    font-size: $font-size-base;
  }

  .category-select {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80rpx;
    background: $bg-color;
    border-radius: $radius-sm;
    padding: 0 20rpx;
    font-size: $font-size-base;
    color: $text-color;

    .arrow {
      color: $text-light;
    }
  }

  .price-input-wrap {
    display: flex;
    align-items: center;
    height: 80rpx;
    background: $bg-color;
    border-radius: $radius-sm;
    padding: 0 20rpx;

    .price-symbol {
      font-size: $font-size-lg;
      color: $primary-color;
      font-weight: 600;
    }

    .price-input {
      flex: 1;
      background: transparent;
      padding: 0;
      margin-left: 8rpx;
    }
  }

  .stock-input-wrap {
    display: flex;
    align-items: center;

    .stock-btn {
      width: 80rpx;
      height: 80rpx;
      background: $bg-color;
      border-radius: $radius-sm 0 0 $radius-sm;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: $font-size-xl;
      color: $text-secondary;
    }

    .stock-input {
      flex: 1;
      height: 80rpx;
      background: $bg-color;
      padding: 0;
      text-align: center;
      border-left: 1rpx solid #E8E8E8;
      border-right: 1rpx solid #E8E8E8;
    }

    .stock-btn:last-child {
      border-radius: 0 $radius-sm $radius-sm 0;
    }
  }
}

.tags-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;

  .tag-item {
    padding: 12rpx 24rpx;
    background: $bg-color;
    border-radius: 20rpx;
    font-size: $font-size-sm;
    color: $text-secondary;

    &.selected {
      background: rgba($primary-color, 0.1);
      color: $primary-color;
    }
  }
}

.custom-tag {
  display: flex;
  gap: 12rpx;

  .tag-input {
    flex: 1;
    height: 72rpx;
    background: $bg-color;
    border-radius: $radius-sm;
    padding: 0 16rpx;
    font-size: $font-size-sm;
  }
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background: $bg-color;
  border-radius: $radius-sm;
  padding: 16rpx;
  font-size: $font-size-base;
}

.submit-section {
  padding: 20rpx 20rpx 60rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  font-size: $font-size-lg;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.picker-modal {
  width: 100%;
  background: $bg-white;
  border-radius: $radius-lg $radius-lg 0 0;
  padding-bottom: $safe-bottom-env;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid $bg-color;

    .modal-title {
      font-size: $font-size-lg;
      font-weight: 600;
    }

    .modal-close {
      font-size: $font-size-xl;
      color: $text-light;
    }
  }

  .picker-content {
    padding: 16rpx 0;

    .picker-item {
      padding: 24rpx;
      font-size: $font-size-base;
      color: $text-color;

      &.selected {
        color: $primary-color;
        background: rgba($primary-color, 0.05);
      }

      &:active {
        background: $bg-color;
      }
    }
  }
}
</style>
