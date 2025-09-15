<template>
  <div class="editor-renderer">
    <div v-if="!data || !data.blocks || data.blocks.length === 0" class="empty-content">
      {{ emptyText }}
    </div>
    <div v-else class="content-blocks">
      <div v-for="(block, index) in data.blocks" :key="index" class="content-block">
        <!-- Paragraph Block -->
        <p v-if="block.type === 'paragraph'" 
           class="paragraph-block"
           v-html="block.data.text">
        </p>
        
        <!-- Header Block -->
        <component 
          v-else-if="block.type === 'header'" 
          :is="`h${block.data.level || 2}`"
          class="header-block"
          v-html="block.data.text">
        </component>
        
        <!-- List Block -->
        <ul v-else-if="block.type === 'list' && block.data.style === 'unordered'" 
            class="list-block unordered">
          <li v-for="(item, idx) in block.data.items" :key="idx" v-html="item"></li>
        </ul>
        <ol v-else-if="block.type === 'list' && block.data.style === 'ordered'" 
            class="list-block ordered">
          <li v-for="(item, idx) in block.data.items" :key="idx" v-html="item"></li>
        </ol>
        
        <!-- Code Block -->
        <pre v-else-if="block.type === 'code'" class="code-block"><code>{{ block.data.code }}</code></pre>
        
        <!-- Table Block -->
        <div v-else-if="block.type === 'table'" class="table-block">
          <table>
            <thead v-if="block.data.withHeadings && block.data.content.length > 0">
              <tr>
                <th v-for="(cell, idx) in block.data.content[0]" :key="idx" v-html="cell"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIdx) in (block.data.withHeadings ? block.data.content.slice(1) : block.data.content)" 
                  :key="rowIdx">
                <td v-for="(cell, cellIdx) in row" :key="cellIdx" v-html="cell"></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Image Block -->
        <div v-else-if="block.type === 'image'" class="image-block">
          <img :src="block.data.file.url" :alt="block.data.caption" />
          <div v-if="block.data.caption" class="image-caption">{{ block.data.caption }}</div>
        </div>
        
        <!-- Link Block -->
        <div v-else-if="block.type === 'linkTool'" class="link-block">
          <a :href="block.data.link" target="_blank" rel="noopener noreferrer">
            <div class="link-preview">
              <img v-if="block.data.meta.image" :src="block.data.meta.image.url" class="link-image" />
              <div class="link-content">
                <div class="link-title">{{ block.data.meta.title }}</div>
                <div class="link-description">{{ block.data.meta.description }}</div>
                <div class="link-url">{{ block.data.link }}</div>
              </div>
            </div>
          </a>
        </div>
        
        <!-- Embed Block -->
        <div v-else-if="block.type === 'embed'" class="embed-block">
          <div v-html="block.data.embed"></div>
          <div v-if="block.data.caption" class="embed-caption">{{ block.data.caption }}</div>
        </div>
        
        <!-- Fallback for unknown blocks -->
        <div v-else class="unknown-block">
          <pre>{{ JSON.stringify(block, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: null
  },
  emptyText: {
    type: String,
    default: 'No content available'
  }
});
</script>

<style scoped lang="scss">
.editor-renderer {
  line-height: 1.6;
  color: #374151;
}

.empty-content {
  color: #9ca3af;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.content-blocks {
  .content-block {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.paragraph-block {
  margin: 0 0 16px 0;
  
  :deep(mark) {
    background-color: #fef08a;
    padding: 2px 4px;
    border-radius: 2px;
  }
  
  :deep(code) {
    background-color: #f3f4f6;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }
}

.header-block {
  margin: 24px 0 16px 0;
  font-weight: 600;
  color: #1f2937;
  
  &:first-child {
    margin-top: 0;
  }
}

.list-block {
  margin: 16px 0;
  padding-left: 20px;
  
  li {
    margin-bottom: 8px;
    
    :deep(mark) {
      background-color: #fef08a;
      padding: 2px 4px;
      border-radius: 2px;
    }
  }
  
  &.unordered {
    list-style-type: disc;
  }
  
  &.ordered {
    list-style-type: decimal;
  }
}

.code-block {
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
  
  code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.4;
  }
}

.table-block {
  margin: 16px 0;
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    
    th, td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
    }
    
    th {
      background-color: #f9fafb;
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
  }
}

.image-block {
  margin: 20px 0;
  text-align: center;
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .image-caption {
    margin-top: 8px;
    font-size: 14px;
    color: #6b7280;
    font-style: italic;
  }
}

.link-block {
  margin: 16px 0;
  
  a {
    text-decoration: none;
    color: inherit;
    
    &:hover .link-preview {
      border-color: #2563eb;
    }
  }
  
  .link-preview {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    gap: 16px;
    transition: border-color 0.2s;
    
    .link-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }
    
    .link-content {
      flex: 1;
      
      .link-title {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .link-description {
        color: #6b7280;
        font-size: 14px;
        margin-bottom: 8px;
        line-height: 1.4;
      }
      
      .link-url {
        color: #2563eb;
        font-size: 13px;
        font-family: monospace;
      }
    }
  }
}

.embed-block {
  margin: 20px 0;
  
  .embed-caption {
    margin-top: 8px;
    text-align: center;
    font-size: 14px;
    color: #6b7280;
    font-style: italic;
  }
}

.unknown-block {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
  
  pre {
    font-size: 12px;
    color: #991b1b;
    margin: 0;
    white-space: pre-wrap;
  }
}
</style>
