<template>
  <div class="study-container">
    <!-- 面包屑导航 -->
    <BreadcrumbNav />
    
    <div class="study-content">
      <!-- 左侧导航 -->
      <div class="sidebar-left">
        <div class="nav-list">
          <div
            v-for="nav in navItems"
            :key="nav.id"
            class="nav-item"
            :class="{ active: activeNav === nav.id }"
            @click="selectNav(nav.id)"
          >
            <i :class="nav.icon" class="nav-icon"></i>
            <span class="nav-text">{{ nav.name }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="main-content">
        <div class="content-sections">
          <div 
            v-for="category in groupedResources" 
            :key="category.id" 
            class="category-section"
          >
            <div class="section-header">
              <h3 class="section-title">{{ category.name }}</h3>
              <span class="section-count">{{ category.tutorials.length }} 个系列</span>
            </div>
            <div class="section-grid">
              <div 
                v-for="item in category.tutorials" 
                :key="item.id" 
                class="content-card" 
                @click="handleCardClick(item)"
              >
                <div class="card-header">
                  <div class="card-title">{{ item.title }}</div>
                  <div class="card-article-count">{{ item.articleCount }} 篇文档</div>
                </div>
                <div class="card-desc">{{ item.desc }}</div>
                <div class="card-tags">
                  <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCategories, getTutorialsByCategory, getTutorialById } from '@/api/staticData'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const navItems = ref([])
const resources = ref([])
const activeNav = ref('all')
const loading = ref(false)
const currentTutorial = ref(null)

// 计算属性：按分类分组资源
const groupedResources = computed(() => {
  if (activeNav.value === 'all') {
    // 显示所有分类
    return navItems.value
      .filter(nav => nav.id !== 'all') // 排除"全部教程"选项
      .map(category => {
        const tutorials = resources.value.filter(item => item.category === category.id)
        return {
          id: category.id,
          name: category.name,
          tutorials: tutorials
        }
      })
      .filter(category => category.tutorials.length > 0) // 只显示有教程的分类
  } else {
    // 显示单个分类
    const category = navItems.value.find(nav => nav.id === activeNav.value)
    if (category) {
      const tutorials = resources.value.filter(item => item.category === activeNav.value)
      return [{
        id: category.id,
        name: category.name,
        tutorials: tutorials
      }]
    }
    return []
  }
})

// 方法
const selectNav = (navId) => {
  activeNav.value = navId
  // 更新路由
  if (navId === 'all') {
    router.push('/study')
  } else {
    router.push(`/study/${navId}`)
  }
}

const handleCardClick = async (item) => {
  console.log('点击了学习卡片:', item)
  
  // 获取教程详情
  const tutorial = await getTutorialById(item.id)
  if (tutorial && tutorial.articles && tutorial.articles.length > 0) {
    // 跳转到对应的教程页面，默认打开第一篇文章
    const firstArticle = tutorial.articles[0]
    router.push(`/tutorial/${item.id}/${firstArticle.id}`)
  } else {
    // 如果没有文章，直接跳转到教程页面
    router.push(`/tutorial/${item.id}`)
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 并行加载分类和教程数据
    const [categories, tutorials] = await Promise.all([
      getCategories(),
      getTutorialsByCategory('all')
    ])
    
    navItems.value = categories
    resources.value = tutorials
    
    console.log('数据加载成功:', { categories, tutorials })
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 根据路由参数加载数据
const loadDataByRoute = async () => {
  const { categoryId, tutorialId } = route.params
  
  if (categoryId) {
    activeNav.value = categoryId
    // 加载指定分类的教程
    const categoryTutorials = await getTutorialsByCategory(categoryId)
    resources.value = categoryTutorials
    
    if (tutorialId) {
      // 如果有教程ID，加载教程详情
      const tutorial = await getTutorialById(tutorialId)
      if (tutorial && tutorial.articles && tutorial.articles.length > 0) {
        // 跳转到第一篇文章
        const firstArticle = tutorial.articles[0]
        router.push(`/tutorial/${tutorialId}/${firstArticle.id}`)
      }
    }
  } else {
    // 默认加载全部教程
    const tutorials = await getTutorialsByCategory('all')
    resources.value = tutorials
  }
}

// 生命周期
onMounted(async () => {
  await loadData()
  await loadDataByRoute()
})

// 监听路由变化
watch(() => route.params, async (newParams) => {
  if (navItems.value.length > 0) {
    await loadDataByRoute()
  }
}, { deep: true })
</script>

<style scoped>
.study-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f6f8fa;
}

.study-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧导航 */
.sidebar-left {
  width: 280px;
  background: white;
  border-right: 1px solid #e1e4e8;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0,0,0,0.06);
}

.nav-list {
  flex: 1;
  padding: 12px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: #f6f8fa;
  border-left-color: #0366d6;
}

.nav-item.active {
  background-color: #f1f8ff;
  border-left-color: #0366d6;
  color: #0366d6;
}

.nav-icon {
  width: 20px;
  margin-right: 12px;
  font-size: 16px;
}

.nav-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

/* 右侧主内容区域 */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.content-sections {
  padding: 32px 40px;
}

.category-section {
  margin-bottom: 48px;
}

.category-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e1e4e8;
}

.section-title {
  margin: 0;
  color: #24292e;
  font-size: 24px;
  font-weight: 600;
}

.section-count {
  color: #586069;
  font-size: 14px;
  font-weight: 500;
  background-color: #f6f8fa;
  padding: 4px 12px;
  border-radius: 12px;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e1e4e8;
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-color: #0366d6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #24292e;
  line-height: 1.3;
  flex: 1;
  margin-right: 12px;
}

.card-article-count {
  padding: 4px 8px;
  background-color: #f1f8ff;
  color: #0366d6;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.card-desc {
  color: #586069;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 2px 8px;
  background-color: #f1f3f4;
  color: #586069;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .study-container {
    flex-direction: column;
  }
  
  .sidebar-left {
    width: 100%;
    height: auto;
  }
  
  .content-sections {
    padding: 20px;
  }
  
  .section-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style> 