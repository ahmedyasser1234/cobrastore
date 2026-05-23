import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/departments');
      return data;
    },
  });
};

export const useCategories = (departmentId?: string) => {
  return useQuery({
    queryKey: ['categories', departmentId],
    queryFn: async () => {
      const url = departmentId 
        ? `/categories?departmentId=${departmentId}`
        : '/categories';
      const { data } = await api.get(url);
      return data;
    },
    enabled: departmentId !== undefined, // only run if we have an ID (if we pass one)
  });
};

export const useSubCategories = (categoryId?: string) => {
  return useQuery({
    queryKey: ['subCategories', categoryId],
    queryFn: async () => {
      const url = categoryId 
        ? `/admin/taxonomy/sub-categories?categoryId=${categoryId}`
        : '/admin/taxonomy/sub-categories';
      const { data } = await api.get(url);
      return data;
    },
    enabled: categoryId !== undefined,
  });
};

export const useCategoryAttributes = (categoryId?: string) => {
  return useQuery({
    queryKey: ['categoryAttributes', categoryId],
    queryFn: async () => {
      const { data } = await api.get(`/categories/${categoryId}/attributes`);
      return data;
    },
    enabled: !!categoryId,
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/categories', data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.departmentId] });
      queryClient.invalidateQueries({ queryKey: ['categories', undefined] });
    },
  });
};

export const useAddSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/admin/taxonomy/sub-categories', data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subCategories', variables.categoryId] });
      queryClient.invalidateQueries({ queryKey: ['subCategories', undefined] });
    },
  });
};

export const useAddDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/departments', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await api.patch(`/departments/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};
