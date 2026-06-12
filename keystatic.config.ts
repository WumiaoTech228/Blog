import { config, fields, collection } from '@keystatic/core';

export default config({
  // 本地开发使用 local 模式，云端部署使用 github 模式
  storage: process.env.NODE_ENV === 'production'
    ? {
        kind: 'github',
        repo: (process.env.KEYSTATIC_GITHUB_REPO || 'WumiaoTech228/Blog') as `${string}/${string}`,
      }
    : {
        kind: 'local',
      },
  
  collections: {
    blog: collection({
      label: '博客文章',
      slugField: 'title',
      // 文章存储路径：src/content/blog/文章标题/index.md
      path: 'src/content/blog/*/',
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: '文章标题' } }),
        description: fields.text({
          label: '文章简介',
          description: '用于在列表页和 SEO 中展示的简短描述',
          multiline: true,
        }),
        date: fields.date({
          label: '发布日期',
          description: '文章的发布时间',
          defaultValue: { kind: 'today' },
        }),
        updatedDate: fields.date({
          label: '修改日期',
          description: '文章的最后修改时间（选填）',
        }),
        draft: fields.checkbox({
          label: '草稿模式',
          description: '勾选后文章将不会在正式网站中显示',
          defaultValue: false,
        }),
        coverImage: fields.image({
          label: '文章顶部 Banner 封面图',
          description: '建议比例 16:9，不上传则使用系统默认的温馨横幅',
        }),
        tags: fields.array(fields.text({ label: '标签' }), {
          label: '文章标签',
          description: '为文章分类添加相关的标签',
          itemLabel: (props) => props.value || '新标签',
        }),
        content: fields.document({
          label: '文章正文',
          description: '使用富文本编辑器撰写你的文章',
          formatting: true,
          dividers: true,
          links: true,
          images: {},
        }),
      },
    }),
  },
});
