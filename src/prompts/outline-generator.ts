import { Note } from "@/types";

interface ProjectInfo {
  title: string;
  field: string | null;
  notes: Array<{
    content: string;
    paperTitle?: string;
    paperAuthors?: string;
    paperYear?: number;
    tags?: string[];
    noteType: string;
  }>;
}

export function buildOutlinePrompt(projectInfo: ProjectInfo): string {
  return `你是一位学术写作指导专家，擅长帮助研究生整理文献综述。

## 任务
根据用户提供的文献阅读笔记，生成一份结构化的文献综述提纲。

## 研究课题
${projectInfo.title}
研究领域：${projectInfo.field || '未指定'}

## 用户的文献笔记（共${projectInfo.notes.length}条）
${projectInfo.notes.map((note, i) => `
### 笔记${i + 1}
- 类型：${note.noteType === 'excerpt' ? '文献摘录' : note.noteType === 'thought' ? '个人想法' : '疑问'}
- 来源：${note.paperTitle || '未标注'}${note.paperAuthors ? ` (${note.paperAuthors}${note.paperYear ? ', ' + note.paperYear : ''})` : ''}
- 标签：${note.tags?.join(', ') || '无'}
- 内容：${note.content}
`).join('\n')}

## 输出要求

请严格按照以下JSON格式输出，不要输出其他内容：

{
  "themes": [
    {
      "title": "主题名称",
      "description": "该主题的简要描述（1-2句话）",
      "noteIndices": [1, 3, 5],
      "subTopics": [
        {
          "title": "子话题",
          "keyPoints": ["要点1", "要点2"],
          "relatedPapers": ["论文标题1", "论文标题2"]
        }
      ]
    }
  ],
  "relationships": [
    {
      "type": "support|contradict|extend|complement",
      "paper1": "论文标题1",
      "paper2": "论文标题2",
      "description": "关系描述"
    }
  ],
  "outline": {
    "title": "综述标题建议",
    "sections": [
      {
        "heading": "章节标题",
        "purpose": "本节目的",
        "keyArguments": ["论点1", "论点2"],
        "citations": ["论文标题1", "论文标题2"],
        "transitionToNext": "过渡到下一节的逻辑"
      }
    ]
  },
  "gaps": [
    {
      "area": "研究空白领域",
      "suggestion": "建议补充的方向",
      "reason": "为什么需要补充"
    }
  ],
  "summary": "对当前笔记覆盖情况的总体评估（2-3句话）"
}

## 注意事项
1. 主题分组要有学术逻辑，不是简单的关键词聚类
2. 综述提纲要有清晰的叙事线索（从背景→现状→问题→展望）
3. 如果笔记数量不足以支撑某个主题，在gaps中指出
4. 论文关系要基于笔记内容推断，不要编造
5. 所有内容必须基于用户提供的笔记，不要添加用户未提及的论文或观点`;
}
