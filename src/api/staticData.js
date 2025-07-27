// 静态数据API服务 - 用于读取静态JSON文件

export async function getCategories() {
  try {
    const response = await fetch('/data/categories.json')
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    return data.categories
  } catch (error) {
    console.error('获取分类列表失败:', error)
    return []
  }
}

export async function getTutorials() {
  try {
    const response = await fetch('/data/tutorials.json')
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    return data.tutorials
  } catch (error) {
    console.error('获取教程列表失败:', error)
    return []
  }
}

export async function getTutorialsByCategory(categoryId) {
  try {
    const tutorials = await getTutorials()
    if (categoryId === 'all') return tutorials
    return tutorials.filter(tutorial => tutorial.category === categoryId)
  } catch (error) {
    console.error('根据分类获取教程失败:', error)
    return []
  }
}

export async function getTutorialById(tutorialId) {
  try {
    const tutorials = await getTutorials()
    return tutorials.find(tutorial => tutorial.id.toString() === tutorialId.toString())
  } catch (error) {
    console.error('获取教程详情失败:', error)
    return null
  }
}

export async function getArticleContent(filename) {
  try {
    const response = await fetch(`/md/${filename}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const markdownText = await response.text()
    const outline = extractSimpleOutline(markdownText)
    return { content: '', outline, markdown: markdownText }
  } catch (error) {
    console.error('获取文章内容失败:', error)
    throw error
  }
}

export async function getArticleContentByStyle(filename, style = 'default') {
  try {
    if (style === 'default') return await getArticleContent(filename)
    const styleFilename = filename.replace('.md', `_${style}.md`)
    const response = await fetch(`/md/${styleFilename}`)
    if (response.ok) {
      const markdownText = await response.text()
      const outline = extractSimpleOutline(markdownText)
      return { content: '', outline, markdown: markdownText }
    } else {
      return await getArticleContent(filename)
    }
  } catch (error) {
    return await getArticleContent(filename)
  }
}

function extractSimpleOutline(markdownText) {
  const lines = markdownText.split('\n')
  const outline = []
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    const h2Match = trimmedLine.match(/^## (.+)$/)
    const h3Match = trimmedLine.match(/^### (.+)$/)
    if (h2Match) {
      outline.push({ title: h2Match[1], level: 2, lineIndex: index })
    } else if (h3Match) {
      outline.push({ title: h3Match[1], level: 3, lineIndex: index })
    }
  })
  return outline
} 