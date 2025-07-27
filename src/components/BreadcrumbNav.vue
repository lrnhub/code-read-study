<template>
  <div class="breadcrumb-nav">
    <div class="breadcrumb-item" @click="goToStudy">
      <i class="fas fa-home"></i>
      <span>学习中心</span>
    </div>
    <div v-if="category" class="breadcrumb-separator">
      <i class="fas fa-chevron-right"></i>
    </div>
    <div v-if="category" class="breadcrumb-item" @click="goToCategory">
      <i :class="category.icon"></i>
      <span>{{ category.name }}</span>
    </div>
    <div v-if="tutorial" class="breadcrumb-separator">
      <i class="fas fa-chevron-right"></i>
    </div>
    <div v-if="tutorial" class="breadcrumb-item" @click="goToTutorial">
      <i class="fas fa-book"></i>
      <span>{{ tutorial.title }}</span>
    </div>
    <div v-if="article" class="breadcrumb-separator">
      <i class="fas fa-chevron-right"></i>
    </div>
    <div v-if="article" class="breadcrumb-item active">
      <i class="fas fa-file-alt"></i>
      <span>{{ article.title }}</span>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCategories, getTutorialById } from '@/api/staticData'
const router = useRouter()
const route = useRoute()
const categories = ref([])
const currentTutorial = ref(null)
const category = computed(() => {
  const categoryId = route.params.categoryId
  if (!categoryId || categories.value.length === 0) return null
  const foundCategory = categories.value.find(cat => cat.id === categoryId)
  if (foundCategory) {
    return { id: foundCategory.id, name: foundCategory.name, icon: foundCategory.icon }
  }
  return { id: categoryId, name: getCategoryName(categoryId), icon: getCategoryIcon(categoryId) }
})
const tutorial = computed(() => {
  const tutorialId = route.params.id || route.params.tutorialId
  if (!tutorialId) return null
  if (currentTutorial.value) {
    return { id: currentTutorial.value.id, title: currentTutorial.value.title }
  }
  return { id: tutorialId, title: `教程 ${tutorialId}` }
})
const article = computed(() => {
  const articleId = route.params.articleId
  if (!articleId) return null
  if (currentTutorial.value && currentTutorial.value.articles) {
    const foundArticle = currentTutorial.value.articles.find(art => art.id === articleId)
    if (foundArticle) {
      return { id: foundArticle.id, title: foundArticle.title }
    }
  }
  return { id: articleId, title: `文章 ${articleId}` }
})
const getCategoryName = (categoryId) => {
  const categoryNames = {
    'zhongkao': '中考',
    'gaokao': '高考',
    'xiaoxue': '小学',
    'chuzhong': '初中',
    'gaozhong': '高中',
    'jingsai': '竞赛'
  }
  return categoryNames[categoryId] || categoryId
}
const getCategoryIcon = (categoryId) => {
  const categoryIcons = {
    'zhongkao': 'fas fa-graduation-cap',
    'gaokao': 'fas fa-university',
    'xiaoxue': 'fas fa-child',
    'chuzhong': 'fas fa-school',
    'gaozhong': 'fas fa-user-graduate',
    'jingsai': 'fas fa-trophy'
  }
  return categoryIcons[categoryId] || 'fas fa-folder'
}
const loadData = async () => {
  try {
    const categoriesData = await getCategories()
    categories.value = categoriesData
    const tutorialId = route.params.id || route.params.tutorialId
    if (tutorialId) {
      const tutorialData = await getTutorialById(tutorialId)
      currentTutorial.value = tutorialData
    }
  } catch (error) {
    console.error('加载面包屑数据失败:', error)
  }
}
const goToStudy = () => { router.push('/study') }
const goToCategory = () => { if (category.value) router.push(`/study/${category.value.id}`) }
const goToTutorial = () => { if (tutorial.value) router.push(`/tutorial/${tutorial.value.id}`) }
onMounted(() => { loadData() })
</script>
<style scoped>
.breadcrumb-nav { display: flex; align-items: center; padding: 12px 20px; background: white; border-bottom: 1px solid #e1e4e8; font-size: 14px; color: #586069; }
.breadcrumb-item { display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: all 0.2s ease; }
.breadcrumb-item:hover { background-color: #f6f8fa; color: #0366d6; }
.breadcrumb-item.active { color: #24292e; cursor: default; font-weight: 500; }
.breadcrumb-item.active:hover { background-color: transparent; color: #24292e; }
.breadcrumb-separator { margin: 0 8px; color: #d1d5da; }
.breadcrumb-item i { font-size: 12px; }
.breadcrumb-item span { font-weight: 500; }
</style> 