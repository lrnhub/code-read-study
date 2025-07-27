// 静态数据API服务 - 用于读取静态JSON文件

// 获取学习分类列表
export async function getCategories() {
  try {
    const response = await fetch('/data/categories.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.categories
  } catch (error) {
    console.error('获取分类列表失败:', error)
    return []
  }
}

// 获取教程列表
export async function getTutorials() {
  try {
    const response = await fetch('/data/tutorials.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.tutorials
  } catch (error) {
    console.error('获取教程列表失败:', error)
    return []
  }
}

// 根据分类获取教程列表
export async function getTutorialsByCategory(categoryId) {
  try {
    const tutorials = await getTutorials()
    if (categoryId === 'all') {
      return tutorials
    }
    return tutorials.filter(tutorial => tutorial.category === categoryId)
  } catch (error) {
    console.error('根据分类获取教程失败:', error)
    return []
  }
}

// 获取单个教程详情
export async function getTutorialById(tutorialId) {
  try {
    const tutorials = await getTutorials()
    return tutorials.find(tutorial => tutorial.id.toString() === tutorialId.toString())
  } catch (error) {
    console.error('获取教程详情失败:', error)
    return null
  }
}

// 获取文章内容
export async function getArticleContent(filename) {
  try {
    console.log('请求文章:', `/md/${filename}`)
    const response = await fetch(`/md/${filename}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const markdownText = await response.text()
    console.log('Markdown内容长度:', markdownText.length)
    
    // 简单提取大纲（只提取 h2, h3 标题）
    const outline = extractSimpleOutline(markdownText)
    
    return {
      content: '', // md-editor-v3 会直接渲染 markdown
      outline: outline,
      markdown: markdownText
    }
  } catch (error) {
    console.error('获取文章内容失败:', error)
    throw error // 重新抛出错误，让组件处理
  }
}

// 根据风格获取文章内容
export async function getArticleContentByStyle(filename, style = 'default') {
  try {
    console.log('请求文章:', `/md/${filename}`, '风格:', style)
    
    // 如果是默认风格，直接获取原始内容
    if (style === 'default') {
      return await getArticleContent(filename)
    }
    
    // 尝试获取风格化内容
    const styleFilename = filename.replace('.md', `_${style}.md`)
    const response = await fetch(`/md/${styleFilename}`)
    
    if (response.ok) {
      const markdownText = await response.text()
      console.log('风格化内容获取成功:', style, '长度:', markdownText.length)
      
      const outline = extractSimpleOutline(markdownText)
      
      return {
        content: '',
        outline: outline,
        markdown: markdownText
      }
    } else {
      // 如果风格化内容不存在，回退到原始内容
      console.log('风格化内容不存在，使用默认内容:', style)
      return await getArticleContent(filename)
    }
  } catch (error) {
    console.error('获取风格化文章内容失败:', error)
    // 出错时回退到原始内容
    return await getArticleContent(filename)
  }
}

// 简单提取大纲函数
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