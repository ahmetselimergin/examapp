<template>
<Teleport to="body">
     <Transition name="modal">
          <div v-if="modelValue" class="modal-overlay" @click="closeOnOverlayClick && close()">
               <div class="modal-container" :class="{ 'fullscreen': fullscreen }" @click.stop>
                    <div class="modal-header">
                         <div v-if="$slots.header" class="modal-header-slot">
                              <slot name="header"></slot>
                         </div>
                         <div v-else class="modal-header-default">
                              <h3 class="modal-title">{{ title }}</h3>
                              <button v-if="showCloseButton" class="modal-close" @click="close">
                                   <span>&times;</span>
                              </button>
                         </div>
                    </div>
                    <div class="modal-content">
                         <slot></slot>
                    </div>
                    <div v-if="$slots.footer" class="modal-footer">
                         <slot name="footer"></slot>
                    </div>
               </div>
          </div>
     </Transition>
</Teleport>
</template>

<script setup>
const props = defineProps({
     modelValue: {
          type: Boolean,
          required: true
     },
     title: {
          type: String,
          default: ''
     },
     showCloseButton: {
          type: Boolean,
          default: true
     },
     closeOnOverlayClick: {
          type: Boolean,
          default: true
     },
     fullscreen: {
          type: Boolean,
          default: false
     }
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
     emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
     position: fixed;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     background-color: rgba(0, 0, 0, 0.5);
     display: flex;
     justify-content: center;
     align-items: center;
     z-index: 1000;
}

.modal-container {
     background-color: var(--bg-primary);
     border-radius: 8px;
     padding: 20px;
     max-width: 30vw;
     height: calc(100% - 32px);
     overflow-y: auto;
     min-width: 30vw;
     position: relative;
     right: 1em;
     margin: auto 0 auto auto;
     border: 1px solid var(--border-primary);
     box-shadow: var(--shadow-lg);
     transition: all 0.3s ease;
}

.modal-container.fullscreen {
     width: 100vw;
     height: 100vh;
     max-width: none;
     min-width: none;
     border-radius: 0;
     padding: 0;
     right: 0;
     margin: 0;
     display: flex;
     flex-direction: column;
}

.modal-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 20px;
}

.modal-header-slot {
     width: 100%;
}

.modal-header-default {
     display: flex;
     justify-content: space-between;
     align-items: center;
     width: 100%;
}

.modal-container.fullscreen .modal-header {
     padding: 20px 24px;
     border-bottom: 1px solid var(--border-primary);
     background: var(--bg-primary);
     position: sticky;
     top: 0;
     z-index: 10;
     margin-bottom: 0;
}

.modal-title {
     margin: 0;
     font-size: 1.25rem;
     font-weight: 600;
     color: var(--text-primary);
}

.modal-close {
     background: none;
     border: none;
     font-size: 1.5rem;
     cursor: pointer;
     padding: 8px;
     color: var(--text-secondary);
     border-radius: 6px;
     transition: all 0.2s ease;
     display: flex;
     align-items: center;
     justify-content: center;
}

.modal-close:hover {
     color: var(--text-primary);
     background: var(--bg-tertiary);
}

.modal-content {
     margin-bottom: 20px;
}

.modal-container.fullscreen .modal-content {
     flex: 1;
     overflow-y: auto;
     margin-bottom: 0;
     padding: 0;
}

.modal-footer {
     display: flex;
     justify-content: flex-end;
     gap: 10px;
}

.modal-container.fullscreen .modal-footer {
     padding: 20px 24px;
     border-top: 1px solid var(--border-primary);
     background: var(--bg-primary);
     position: sticky;
     bottom: 0;
     z-index: 10;
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
     transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
     opacity: 0;
}
</style>
