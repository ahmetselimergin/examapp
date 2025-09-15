import { ref, computed } from 'vue'
import api from '../services/api'
import type { ApiResponse } from '../types'

export interface ApiState<T> {
  data: T[]
  loading: boolean
  error: string
}

export function useApi<T = any>() {
  const data = ref<T[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchData = async (endpoint: string, options?: any) => {
    loading.value = true
    error.value = ''
    try {
      const response = await api.get(endpoint, options)
      data.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Veri alınamadı'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createData = async (endpoint: string, payload: any) => {
    loading.value = true
    error.value = ''
    try {
      const response = await api.post(endpoint, payload)
      data.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Oluşturma işlemi başarısız'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateData = async (endpoint: string, payload: any) => {
    loading.value = true
    error.value = ''
    try {
      const response = await api.put(endpoint, payload)
      const index = data.value.findIndex(item => (item as any)._id === response.data._id)
      if (index !== -1) {
        data.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Güncelleme işlemi başarısız'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteData = async (endpoint: string, id: string) => {
    loading.value = true
    error.value = ''
    try {
      await api.delete(`${endpoint}/${id}`)
      data.value = data.value.filter(item => (item as any)._id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Silme işlemi başarısız'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = ''
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchData,
    createData,
    updateData,
    deleteData,
    clearError
  }
}
