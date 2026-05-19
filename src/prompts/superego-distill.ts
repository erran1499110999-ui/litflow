interface SuperEgoPromptParams {
  targetName: string;
  targetType: "self" | "other";
  texts: string[];
}

export function buildSuperEgoPrompt(params: SuperEgoPromptParams): string {
  return `你是一位学术写作分析专家，擅长从学术文本中提炼作者的学术人格特征。

## 任务
分析以下 ${params.texts.length} 篇学术文本，提炼${
    params.targetType === "self" ? "用户自己" : `"${params.targetName}"`
  }的学术人格画像。

## 文本素材
${params.texts
  .map(
    (text, i) => `
### 文本 ${i + 1}
${text.slice(0, 8000)}
`
  )
  .join("\n")}

## 输出要求
请严格按照以下 JSON 格式输出：

{
  "profile_name": "${params.targetName}",
  "research_interests": [
    {
      "topic": "研究兴趣主题",
      "evidence": "从文本中提取的证据",
      "depth": "core|secondary|emerging"
    }
  ],
  "writing_style": {
    "structure_pattern": "论证结构模式描述",
    "paragraph_style": "段落组织风格",
    "evidence_preference": "偏好的论证方式（数据驱动/理论推导/案例分析等）",
    "tone": "学术语气特征（谨慎/自信/批判/中立等）",
    "sentence_features": ["句式特征1", "句式特征2"]
  },
  "academic_stance": {
    "methodology": "方法论偏好",
    "epistemology": "认识论立场",
    "key_positions": ["核心学术立场1", "核心学术立场2"]
  },
  "expressions": {
    "frequent_phrases": ["高频表达1", "高频表达2", "高频表达3"],
    "transition_patterns": ["过渡句模式1", "过渡句模式2"],
    "hedging_style": "模糊限制语使用风格"
  },
  "vocabulary": {
    "domain_terms": ["领域核心术语1", "术语2", "术语3"],
    "preferred_verbs": ["偏好动词1", "动词2"],
    "avoidance": ["刻意回避的表达"]
  },
  "summary": "用 2-3 句话总结此人的学术人格特征"
}

## 注意事项
1. 所有分析必须基于提供的文本，不要编造
2. 如果文本数量不足以得出某项结论，标注“证据不足”
3. 区分核心特征和偶发特征
4. 写作风格分析要具体到可操作的程度（让人能模仿）
5. 表达习惯要给出原文例句`;
}
