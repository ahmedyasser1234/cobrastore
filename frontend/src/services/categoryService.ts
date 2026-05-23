import api from './api';

export const categoryService = {
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategoriesByDepartment: async (deptId: string) => {
    const response = await api.get(`/categories/department/${deptId}`);
    return response.data;
  }
};
