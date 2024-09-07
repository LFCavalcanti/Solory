import { tUserToBusinessRole } from '@/types/BusinessRole/tUserToBusinessRole';
import { create } from 'zustand';

interface iSupplierAddressesStore {
  userToBusinessRoleList: tUserToBusinessRole[];
  insertUserToBusinessRole: (userToBusinessRole: tUserToBusinessRole) => void;
  updateUserToBusinessRole: (userToBusinessRole: tUserToBusinessRole) => void;
  removeUserToBusinessRole: (userToBusinessRole: tUserToBusinessRole) => void;
  setList: (userToBusinessRoleNewList: tUserToBusinessRole[]) => void;
  clearList: () => void;
}

export const useUserToBusinessRoleStore = create<iSupplierAddressesStore>()(
  (set) => ({
    userToBusinessRoleList: [],
    insertUserToBusinessRole: (userToBusinessRole: tUserToBusinessRole) => {
      set((state) => ({
        userToBusinessRoleList: [
          ...state.userToBusinessRoleList,
          userToBusinessRole,
        ],
      }));
    },
    updateUserToBusinessRole: (userToBusinessRole: tUserToBusinessRole) => {
      set((state) => ({
        userToBusinessRoleList: state.userToBusinessRoleList.map((item) => {
          if (
            item.id === userToBusinessRole.id ||
            item.userId === userToBusinessRole.userId
          )
            return userToBusinessRole;
          return item;
        }),
      }));
    },
    removeUserToBusinessRole: (userToBusinessRole: tUserToBusinessRole) => {
      set((state) => ({
        userToBusinessRoleList: state.userToBusinessRoleList.filter((item) => {
          if (!item.id) return item.userId !== userToBusinessRole.userId;
          return item.id !== userToBusinessRole.id;
        }),
      }));
    },
    setList: (addressLoaded: tUserToBusinessRole[]) =>
      set({ userToBusinessRoleList: addressLoaded }),
    clearList: () => set({ userToBusinessRoleList: [] }),
  }),
);
