<template>
<Teleport to="body">
     <Transition name="modal">
          <div v-if="modelValue" class="modal-overlay" @click="closeOnOverlayClick && close()">
               <div class="modal-container" @click.stop>
                    <div class="modal-header">
                         <h3 class="modal-title">{{ title }}</h3>
                         <button v-if="showCloseButton" class="modal-close" @click="close">
                              <span>&times;</span>
                         </button>
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
     background-color: white;
     border-radius: 8px;
     padding: 20px;
     max-width: 30vw;
     height: calc(100% - 32px);
     overflow-y: auto;
     min-width: 30vw;
     position: relative;
     right: 1em;
     margin: auto 0 auto auto;
}

.modal-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 20px;
}

.modal-title {
     margin: 0;
     font-size: 1.25rem;
     font-weight: 600;
}

.modal-close {
     background: none;
     border: none;
     font-size: 1.5rem;
     cursor: pointer;
     padding: 0;
     color: #666;
}

.modal-close:hover {
     color: #333;
}

.modal-content {
     margin-bottom: 20px;
}

.modal-footer {
     display: flex;
     justify-content: flex-end;
     gap: 10px;
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
