<template>
  <div class="tutorial-container">
    <!-- 面包屑导航 -->
    <BreadcrumbNav />
    
    <div class="tutorial-content">
      <!-- 左侧文章列表 -->
      <div class="sidebar-left">
        <div class="sidebar-header">
          <h3>{{ currentTutorial?.title || '教程文章' }}</h3>
          <div class="search-wrapper">
            <input
              v-model="searchKeyword"
              type="text"
              class="search-input"
              placeholder="搜索文章..."
            />
            <i class="fas fa-search search-icon"></i>
          </div>
        </div>
        <div class="article-list">
          <div
            v-for="article in filteredArticles"
            :key="article.id"
            class="article-item"
            :class="{ active: currentArticle?.id === article.id }"
            @click="selectArticle(article)"
          >
            <div class="article-title">{{ article.title }}</div>
            <div class="article-meta">
              <span class="article-difficulty" :class="article.difficulty">{{ article.difficulty }}</span>
              <span class="meta-item">更新时间：{{ currentTutorial?.updateTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间文章详情 -->
      <div class="main-content">
        <div v-if="loading" class="loading-content">
          <el-loading-spinner />
          <p>正在加载文章...</p>
        </div>
        <div v-else-if="currentArticle" class="article-content">
          <!-- 风格选择器 -->
          <div class="style-selector-container">
            <span class="style-label">内容风格：</span>
            <el-select v-model="currentStyle" placeholder="选择风格" size="small" @change="handleStyleChange">
              <el-option
                v-for="style in contentStyles"
                :key="style.code"
                :label="style.displayName"
                :value="style.code"
              />
            </el-select>
          </div>
          
          <!-- 使用 md-editor-v3 渲染 markdown -->
          <MdPreview
            class="content-body"
            v-if="currentArticle.markdown"
            :modelValue="processedMarkdown"
            :theme="'light'"
            style="background: none; border: none; box-shadow: none; padding: 0;"
          />
          <div v-else class="content-body">{{ currentArticle.content }}</div>
        </div>
        <div v-else class="empty-content">
          <el-empty description="请选择左侧文章查看详情" />
        </div>
      </div>

      <!-- 右侧大纲 -->
      <div class="sidebar-right">
        <div class="outline-header">
          <h3>文章大纲</h3>
        </div>
        <div v-if="currentArticle" class="outline-content">
          <div
            v-for="(outline, index) in currentArticle.outline"
            :key="index"
            class="outline-item"
            :class="{ 
              active: activeOutline === index,
              'outline-h3': outline.level === 3 
            }"
            @click="scrollToSection(index)"
          >
            <span class="outline-text">{{ outline.title }}</span>
          </div>
        </div>
        <div v-else class="empty-outline">
          <el-empty description="暂无大纲" :image-size="60" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTutorialById, getArticleContentByStyle } from '@/api/staticData'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const currentTutorial = ref(null)
const currentArticle = ref(null)
const activeOutline = ref(0)
const loading = ref(false)

// 风格切换相关
const currentStyle = ref('default')
const contentStyles = ref([
  { code: 'default', displayName: '默认风格' },
  { code: 'xiaohongshu', displayName: '小红书风格' },
  { code: 'douyin', displayName: '抖音风格' },
  { code: 'wechat', displayName: '微信风格' },
  { code: 'bilibili', displayName: 'B站风格' },
  { code: 'zhihu', displayName: '知乎风格' },
  { code: 'weibo', displayName: '微博风格' }
])

// 计算属性
const filteredArticles = computed(() => {
  if (!currentTutorial.value) return []
  
  const articles = currentTutorial.value.articles || []
  if (!searchKeyword.value) {
    return articles
  }
  return articles.filter(article => 
    article.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 处理图片路径的markdown内容
const processedMarkdown = computed(() => {
  if (!currentArticle.value?.markdown) return ''
  
  let markdown = currentArticle.value.markdown
  
  // 处理图片路径
  markdown = markdown.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, path) => {
      // 如果是绝对URL，直接返回
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return match
      }
      
      // 如果是 /static/images/ 开头的路径，直接使用
      if (path.startsWith('/static/images/')) {
        const baseUrl = window.location.origin
        return `![${alt}](${baseUrl}${path})`
      }
      
      // 如果是其他绝对路径（以/开头），添加域名
      if (path.startsWith('/')) {
        const baseUrl = window.location.origin
        return `![${alt}](${baseUrl}${path})`
      }
      
      // 如果是相对路径，根据当前文章位置构建路径
      if (path.startsWith('./') || path.startsWith('../')) {
        const baseUrl = window.location.origin
        const cleanPath = path.replace(/^\.\.?\//, '')
        const fullPath = `/images/${cleanPath}`
        return `![${alt}](${baseUrl}${fullPath})`
      }
      
      // 如果是简单文件名，添加默认图片路径
      if (!path.includes('/')) {
        const baseUrl = window.location.origin
        const fullPath = `/images/${path}`
        return `![${alt}](${baseUrl}${fullPath})`
      }
      
      return match
    }
  )
  
  return markdown
})

// 方法
const handleStyleChange = async () => {
  if (!currentArticle.value) return
  
  try {
    const content = await getArticleContentByStyle(currentArticle.value.filename, currentStyle.value)
    if (content) {
      currentArticle.value = {
        ...currentArticle.value,
        ...content
      }
      nextTick(() => {
        bindImageErrorHandlers()
      })
    }
  } catch (error) {
    console.error('切换风格失败:', error)
  }
}

// 图片错误处理
const handleImageError = (event) => {
  const img = event.target
  img.style.display = 'none'
  
  const errorDiv = document.createElement('div')
  errorDiv.className = 'image-error'
  errorDiv.innerHTML = `
    <div class="error-content">
      <i class="el-icon-picture-outline"></i>
      <p>图片加载失败</p>
      <small>${img.alt || '未知图片'}</small>
    </div>
  `
  
  img.parentNode.insertBefore(errorDiv, img.nextSibling)
}

// 绑定图片错误处理
const bindImageErrorHandlers = () => {
  const images = document.querySelectorAll('.content-body img')
  images.forEach(img => {
    img.addEventListener('error', handleImageError)
    
    const originalSrc = img.src
    img.title = `图片路径: ${originalSrc}`
    
    img.addEventListener('click', () => {
      console.log('图片路径:', originalSrc)
    })
  })
}

const selectArticle = async (article, pushRoute = true) => {
  if (!article) return
  
  loading.value = true
  try {
    console.log('正在加载文章:', article.filename)
    const content = await getArticleContentByStyle(article.filename, currentStyle.value)
    console.log('文章内容获取成功:', content)
    
    currentArticle.value = {
      ...article,
      ...content
    }
    activeOutline.value = 0
    
    nextTick(() => {
      bindImageErrorHandlers()
    })
    
    if (pushRoute && route.params.articleId !== article.id) {
      router.replace(`/tutorial/${route.params.id}/${article.id}`)
    }
    
    nextTick(() => {
      const mainContent = document.querySelector('.main-content')
      if (mainContent) {
        mainContent.scrollTop = 0
        mainContent.removeEventListener('scroll', updateActiveOutline)
        mainContent.addEventListener('scroll', updateActiveOutline)
      }
    })
  } catch (error) {
    console.error('加载文章失败:', error)
    currentArticle.value = {
      ...article,
      content: '<p>文章加载失败，请检查网络连接或刷新页面重试。</p>',
      outline: [],
      markdown: ''
    }
  } finally {
    loading.value = false
  }
}

const scrollToSection = (index) => {
  activeOutline.value = index
  nextTick(() => {
    const mainContent = document.querySelector('.main-content')
    if (mainContent) {
      const headings = document.querySelectorAll('.content-body h2, .content-body h3')
      if (headings[index]) {
        const offset = 120
        const elementTop = headings[index].offsetTop - offset
        
        mainContent.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        })
      }
    }
  })
}

// 防抖函数
let scrollTimer = null

// 监听滚动，更新大纲激活状态
const updateActiveOutline = () => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  
  scrollTimer = setTimeout(() => {
    if (!currentArticle.value) return
    
    const mainContent = document.querySelector('.main-content')
    if (!mainContent) return
    
    const headings = document.querySelectorAll('.content-body h2, .content-body h3')
    const scrollTop = mainContent.scrollTop
    const offset = 120
    
    let activeIndex = 0
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i]
      const elementTop = heading.offsetTop - offset
      
      if (scrollTop >= elementTop) {
        activeIndex = i
      }
    }
    
    if (activeIndex !== activeOutline.value) {
      activeOutline.value = activeIndex
    }
  }, 100)
}

// 根据ID查找文章
const findArticleById = (tutorial, articleId) => {
  if (!tutorial || !tutorial.articles) return null
  return tutorial.articles.find(article => article.id === articleId)
}

// 根据路由参数加载指定教程和文章
const loadTutorialAndArticle = async (tutorialId, articleId) => {
  const tutorial = await getTutorialById(tutorialId)
  if (tutorial) {
    currentTutorial.value = tutorial
    
    if (articleId) {
      const article = findArticleById(tutorial, articleId)
      if (article) {
        await selectArticle(article, false)
      } else {
        console.error('未找到ID为', articleId, '的文章')
        if (tutorial.articles && tutorial.articles.length > 0) {
          await selectArticle(tutorial.articles[0], false)
        }
      }
    } else {
      if (tutorial.articles && tutorial.articles.length > 0) {
        await selectArticle(tutorial.articles[0], false)
      }
    }
  } else {
    console.error('未找到ID为', tutorialId, '的教程')
    router.push('/study')
  }
}

// 加载教程数据
const loadTutorial = async () => {
  loading.value = true
  try {
    if (route.params.id) {
      await loadTutorialAndArticle(route.params.id, route.params.articleId)
    } else {
      console.error('未提供教程ID')
    }
  } catch (error) {
    console.error('加载教程失败:', error)
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadTutorial()
})

// 监听路由参数变化
watch(() => [route.params.id, route.params.articleId], async ([newId, newArticleId]) => {
  if (newId) {
    await loadTutorialAndArticle(newId, newArticleId)
  }
})
</script>

<style scoped>
.tutorial-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f6f8fa;
}

.tutorial-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧边栏 */
.sidebar-left {
  width: 320px;
  background: white;
  border-right: 1.5px solid #f0f1f3;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(59,130,246,0.03);
}

.sidebar-header {
  padding: 20px 16px 16px 16px;
  border-bottom: 1px solid #f0f1f3;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  height: 36px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0 36px 0 12px;
  font-size: 14px;
  color: #333;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.search-input:focus {
  background: #fff;
  border-color: #1ec08b;
  box-shadow: 0 0 0 2px rgba(30, 192, 139, 0.1);
}

.search-input::placeholder {
  color: #adb5bd;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s ease;
  z-index: 2;
}

.search-icon:hover {
  color: #1ec08b;
}

.sidebar-header h3 {
  margin: 0 0 12px 0;
  color: #222;
  font-size: 18px;
  font-weight: 600;
}

.article-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.article-item {
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0;
  border: 1px solid transparent;
  background: #fff;
  position: relative;
  border-bottom: 1px solid #f0f1f3;
}

.article-item:last-child {
  border-bottom: none;
}

.article-item:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  transform: translateX(2px);
}

.article-item.active {
  background-color: #f0fdf6;
  border-color: #1ec08b;
  color: #1ec08b;
}

.article-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-top: 4px;
  color: #888;
}

.article-difficulty {
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
}

.article-difficulty.初级 {
  background-color: #f0fdf6;
  color: #1ec08b;
}

.article-difficulty.中级 {
  background-color: #fef3c7;
  color: #d97706;
}

.article-difficulty.高级 {
  background-color: #fef2f2;
  color: #dc2626;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: white;
}

.article-content {
  max-width: 1100px;
  margin: 0px auto 40px auto;
  padding: 10px 48px 56px 48px;
  min-height: 100%;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.06);
}

.content-body {
  line-height: 1;
  color: #222;
  font-size: 18px;
  word-break: break-word;
}

.content-body h2 {
  margin: 48px 0 24px 0;
  color: #1a2233;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.3;
}

.content-body h3 {
  margin: 36px 0 18px 0;
  color: #1a2233;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
}

.content-body p {
  margin: 0 0 24px 0;
  font-size: 18px;
  line-height: 1.5;
}

.content-body ul, .content-body ol {
  margin: 0 0 24px 0;
  padding-left: 28px;
}

.content-body li {
  margin-bottom: 10px;
  font-size: 18px;
  line-height: 2;
}

.content-body img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 16px 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.content-body img:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.content-body img:active {
  transform: scale(0.98);
}

.empty-content,
.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex-direction: column;
}

.loading-content p {
  margin-top: 20px;
  color: #888;
  font-size: 16px;
  font-weight: 500;
}

/* 右侧边栏 */
.sidebar-right {
  width: 280px;
  background: white;
  border-left: 1px solid #f0f1f3;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(59,130,246,0.03);
}

.outline-header {
  padding: 20px 16px 16px 16px;
  border-bottom: 1px solid #f0f1f3;
}

.outline-header h3 {
  margin: 0;
  color: #222;
  font-size: 18px;
  font-weight: 600;
}

.outline-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.outline-item {
  padding: 2px 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  margin-bottom: 2px;
  font-size: 13px;
  color: #333;
  border: 1px solid transparent;
  background: #fff;
  line-height: 1.2;
  min-height: 24px;
}

.outline-item.outline-h3 {
  padding-left: 28px;
  font-size: 12px;
  color: #666;
  min-height: 22px;
}

.outline-item:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  transform: translateX(2px);
}

.outline-item.active {
  background-color: #f0fdf6;
  border-color: #1ec08b;
  color: #1ec08b;
  font-weight: 500;
}

.outline-text {
  display: block;
  line-height: 1.4;
}

.empty-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

/* 风格选择器样式 */
.style-selector-container {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.style-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}

.style-selector-container .el-select {
  min-width: 120px;
}

/* 图片错误处理样式 */
.content-body .image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  margin: 16px 0;
}

.content-body .image-error .error-content {
  text-align: center;
  color: #6c757d;
}

.content-body .image-error .error-content i {
  font-size: 32px;
  margin-bottom: 8px;
  display: block;
}

.content-body .image-error .error-content p {
  margin: 4px 0;
  font-weight: 500;
}

.content-body .image-error .error-content small {
  font-size: 12px;
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .sidebar-right {
    display: none;
  }
}

@media (max-width: 768px) {
  .tutorial-container {
    flex-direction: column;
  }
  
  .sidebar-left {
    width: 100%;
    height: 200px;
  }
  
  .article-content {
    padding: 20px;
  }
}
</style> 