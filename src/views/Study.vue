<template>
  <div class="study-container">
    <BreadcrumbNav />
    <div class="study-content">
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
      <div class="main-content">
        <div class="content-sections">
          <div v-for="category in groupedResources" :key="category.id" class="category-section">
            <div class="section-header">
              <h3 class="section-title">{{ category.name }}</h3>
              <span class="section-count">{{ category.tutorials.length }} 个系列</span>
            </div>
            <div class="section-grid">
              <div v-for="item in category.tutorials" :key="item.id" class="content-card" @click="handleCardClick(item)">
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
const navItems = ref([])
const resources = ref([])
const activeNav = ref('all')
const loading = ref(false)
const groupedResources = computed(() => {
  if (activeNav.value === 'all') {
    return navItems.value.filter(nav => nav.id !== 'all').map(category => {
      const tutorials = resources.value.filter(item => item.category === category.id)
      return { id: category.id, name: category.name, tutorials }
    }).filter(category => category.tutorials.length > 0)
  } else {
    const category = navItems.value.find(nav => nav.id === activeNav.value)
    if (category) {
      const tutorials = resources.value.filter(item => item.category === activeNav.value)
      return [{ id: category.id, name: category.name, tutorials }]
    }
    return []
  }
})
const selectNav = (navId) => {
  activeNav.value = navId
  if (navId === 'all') {
    router.push('/study')
  } else {
    router.push(`/study/${navId}`)
  }
}
const handleCardClick = async (item) => {
  const tutorial = await getTutorialById(item.id)
  if (tutorial && tutorial.articles && tutorial.articles.length > 0) {
    const firstArticle = tutorial.articles[0]
    router.push(`/tutorial/${item.id}/${firstArticle.id}`)
  } else {
    router.push(`/tutorial/${item.id}`)
  }
}
const loadData = async () => {
  loading.value = true
  try {
    const [categories, tutorials] = await Promise.all([
      getCategories(),
      getTutorialsByCategory('all')
    ])
    navItems.value = categories
    resources.value = tutorials
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}
const loadDataByRoute = async () => {
  const { categoryId, tutorialId } = route.params
  if (categoryId) {
    activeNav.value = categoryId
    const categoryTutorials = await getTutorialsByCategory(categoryId)
    resources.value = categoryTutorials
    if (tutorialId) {
      const tutorial = await getTutorialById(tutorialId)
      if (tutorial && tutorial.articles && tutorial.articles.length > 0) {
        const firstArticle = tutorial.articles[0]
        router.push(`/tutorial/${tutorialId}/${firstArticle.id}`)
      }
    }
  } else {
    const tutorials = await getTutorialsByCategory('all')
    resources.value = tutorials
  }
}
onMounted(async () => {
  await loadData()
  await loadDataByRoute()
})
watch(() => route.params, async () => {
  if (navItems.value.length > 0) {
    await loadDataByRoute()
  }
}, { deep: true })
</script>
<style scoped>
.study-container { display: flex; flex-direction: column; height: 100vh; background-color: #f6f8fa; }
.study-content { display: flex; flex: 1; overflow: hidden; }
.sidebar-left { width: 280px; background: white; border-right: 1px solid #e1e4e8; display: flex; flex-direction: column; box-shadow: 2px 0 8px rgba(0,0,0,0.06); }
.nav-list { flex: 1; padding: 12px 0; }
.nav-item { display: flex; align-items: center; padding: 12px 20px; cursor: pointer; transition: all 0.2s ease; border-left: 3px solid transparent; }
.nav-item:hover { background-color: #f6f8fa; border-left-color: #0366d6; }
.nav-item.active { background-color: #f1f8ff; border-left-color: #0366d6; color: #0366d6; }
.nav-icon { width: 20px; margin-right: 12px; font-size: 16px; }
.nav-text { flex: 1; font-size: 14px; font-weight: 500; }
.main-content { flex: 1; overflow-y: auto; padding: 0; }
.content-sections { padding: 32px 40px; }
.category-section { margin-bottom: 48px; }
.category-section:last-child { margin-bottom: 0; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #e1e4e8; }
.section-title { margin: 0; color: #24292e; font-size: 24px; font-weight: 600; }
.section-count { color: #586069; font-size: 14px; font-weight: 500; background-color: #f6f8fa; padding: 4px 12px; border-radius: 12px; }
.section-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
.content-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.3s ease; border: 1px solid #e1e4e8; }
.content-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-color: #0366d6; }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.card-title { font-size: 18px; font-weight: 600; color: #24292e; line-height: 1.3; flex: 1; margin-right: 12px; }
.card-article-count { padding: 4px 8px; background-color: #f1f8ff; color: #0366d6; border-radius: 6px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.card-desc { color: #586069; font-size: 14px; line-height: 1.5; margin-bottom: 16px; }
.card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { padding: 2px 8px; background-color: #f1f3f4; color: #586069; border-radius: 4px; font-size: 12px; font-weight: 500; }
@media (max-width: 768px) { .study-container { flex-direction: column; } .sidebar-left { width: 100%; height: auto; } .content-sections { padding: 20px; } .section-grid { grid-template-columns: 1fr; } .section-header { flex-direction: column; align-items: flex-start; gap: 8px; } }
</style> 