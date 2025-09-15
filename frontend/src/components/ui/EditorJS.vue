<template>
  <div>
    <label v-if="label" class="editor-label">{{ label }}</label>
    <div :id="editorId" class="editor-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Image from '@editorjs/image';
import Table from '@editorjs/table';
import Code from '@editorjs/code';
import LinkTool from '@editorjs/link';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import Embed from '@editorjs/embed';

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  placeholder: {
    type: String,
    default: 'Write your question here...'
  },
  label: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  },
  minHeight: {
    type: String,
    default: '200px'
  }
});

const emit = defineEmits(['update:modelValue', 'ready']);

const editorId = ref(`editor-${Math.random().toString(36).substr(2, 9)}`);
const editor = ref(null);
const isInitialized = ref(false);
let changeTimeout = null;

const initEditor = async () => {
  if (editor.value) {
    await editor.value.destroy();
  }

  try {
    // Ensure we have valid data structure
    const initialData = props.modelValue && props.modelValue.blocks ? props.modelValue : undefined;
    
    editor.value = new EditorJS({
      holder: editorId.value,
      placeholder: props.placeholder,
      readOnly: props.readonly,
      data: initialData,
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: 'Enter a header',
            levels: [2, 3, 4],
            defaultLevel: 3
          }
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },
        image: {
          class: Image,
          config: {
            endpoints: {
              byFile: '/api/upload/image', // You'll need to implement this endpoint
              byUrl: '/api/upload/image-by-url', // You'll need to implement this endpoint
            }
          }
        },
        table: {
          class: Table,
          inlineToolbar: true,
        },
        code: {
          class: Code,
        },
        linkTool: {
          class: LinkTool,
          config: {
            endpoint: '/api/fetchUrl', // You'll need to implement this endpoint for link previews
          }
        },
        marker: {
          class: Marker,
        },
        inlineCode: {
          class: InlineCode,
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              vimeo: true
            }
          }
        }
      },
      onChange: async () => {
        if (isInitialized.value && editor.value) {
          // Clear previous timeout
          if (changeTimeout) {
            clearTimeout(changeTimeout);
          }
          
          // Debounce the change event to prevent too frequent updates
          changeTimeout = setTimeout(async () => {
            try {
              const outputData = await editor.value.save();
              console.log("Editor.js onChange - saving data:", outputData);
              emit('update:modelValue', outputData);
            } catch (error) {
              console.error('Saving failed: ', error);
            }
          }, 100); // Reduced debounce to 100ms for better responsiveness
        }
      },
      onReady: () => {
        isInitialized.value = true;
        // If we have initial data, render it now
        if (props.modelValue && props.modelValue.blocks && props.modelValue.blocks.length > 0) {
          updateContent(props.modelValue);
        }
        emit('ready');
      }
    });
  } catch (error) {
    console.error('Editor initialization failed:', error);
  }
};

const updateContent = async (newValue) => {
  if (editor.value && isInitialized.value) {
    try {
      await editor.value.render(newValue || { blocks: [] });
    } catch (error) {
      console.error('Content update failed:', error);
    }
  }
};

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (!isInitialized.value) return;
    
    // Only update if the content is significantly different and not empty
    if (newValue && newValue.blocks && newValue.blocks.length > 0) {
      editor.value?.save().then((currentData) => {
        // Only update if the blocks are actually different
        const currentBlocks = currentData.blocks || [];
        const newBlocks = newValue.blocks || [];
        
        if (currentBlocks.length !== newBlocks.length || 
            JSON.stringify(currentBlocks) !== JSON.stringify(newBlocks)) {
          updateContent(newValue);
        }
      }).catch(() => {
        // Ignore save errors during comparison
      });
    } else if (!newValue || !newValue.blocks || newValue.blocks.length === 0) {
      // Clear editor if no content
      updateContent({ blocks: [] });
    }
  },
  { deep: true }
);

onMounted(async () => {
  await nextTick();
  await initEditor();
});

onUnmounted(() => {
  if (changeTimeout) {
    clearTimeout(changeTimeout);
  }
  if (editor.value) {
    editor.value.destroy();
  }
});

// Expose methods for parent component
defineExpose({
  save: () => editor.value?.save(),
  clear: () => editor.value?.clear(),
  focus: () => editor.value?.focus()
});
</script>

<style scoped lang="scss">
.editor-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.editor-container {
  min-height: v-bind(minHeight);
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 12px;
  background: white;
  
  &:focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
}

:deep(.codex-editor) {
  .codex-editor__redactor {
    padding-bottom: 0 !important;
  }
  
  .ce-block__content {
    max-width: none;
    margin: 0;
  }
  
  .ce-toolbar__content {
    max-width: none;
  }
  
  .ce-paragraph {
    line-height: 1.5;
  }
  
  .ce-header {
    margin: 12px 0 8px 0;
    
    &[contenteditable="true"][data-placeholder]::before {
      color: #9ca3af;
    }
  }
  
  .ce-list {
    margin: 8px 0;
  }
  
  .ce-code {
    background: #f3f4f6;
    border-radius: 4px;
    margin: 8px 0;
  }
  
  .ce-table {
    margin: 12px 0;
  }
}
</style>
