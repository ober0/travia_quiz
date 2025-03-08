export enum PermissionEnum {
    UserCreate = 'user-create',
    UserGet = 'user-get',
    UserGetAll = 'user-get-all',
    UserUpdate = 'user-update',
    UserDelete = 'user-delete',

    PermissionCreate = 'permission-create',
    PermissionGet = 'permission-get',
    PermissionGetAll = 'permission-get-all',
    PermissionUpdate = 'permission-update',
    PermissionDelete = 'permission-delete',

    RoleCreate = 'role-create',
    RoleGet = 'role-get',
    RoleGetAll = 'role-get-all',
    RoleUpdate = 'role-update',
    RoleDelete = 'role-delete',

    RolePermissionCreate = 'role-permission-create',
    RolePermissionGet = 'role-permission-get',
    RolePermissionGetAll = 'role-permission-get-all',
    RolePermissionUpdate = 'role-permission-update',
    RolePermissionDelete = 'role-permission-delete',

    AdminMenu = 'admin-menu',
    AdminBranding = 'admin-branding',

    PlanCreate = 'plan-create',
    PlanGet = 'plan-get',
    PlanGetAll = 'plan-get-all',
    PlanUpdate = 'plan-update',
    PlanDelete = 'plan-delete'
}

export const PermissionDescriptions: Record<any, string> = {
    // Разрешения
    [PermissionEnum.PermissionCreate]: 'Создание разрешения',
    [PermissionEnum.PermissionGet]: 'Получение информации о разрешении',
    [PermissionEnum.PermissionGetAll]: 'Получение списка разрешений',
    [PermissionEnum.PermissionUpdate]: 'Обновление разрешения',
    [PermissionEnum.PermissionDelete]: 'Удаление разрешения',

    // Роли
    [PermissionEnum.RoleCreate]: 'Создание роли',
    [PermissionEnum.RoleGet]: 'Получение информации о роли',
    [PermissionEnum.RoleGetAll]: 'Получение списка ролей',
    [PermissionEnum.RoleUpdate]: 'Обновление роли',
    [PermissionEnum.RoleDelete]: 'Удаление роли',

    // Связь ролей и разрешений
    [PermissionEnum.RolePermissionCreate]: 'Создание связи роли и разрешения',
    [PermissionEnum.RolePermissionGet]: 'Получение информации о связи роли и разрешения',
    [PermissionEnum.RolePermissionGetAll]: 'Получение списка связей ролей и разрешений',
    [PermissionEnum.RolePermissionUpdate]: 'Обновление связи роли и разрешения',
    [PermissionEnum.RolePermissionDelete]: 'Удаление связи роли и разрешения',

    [PermissionEnum.AdminMenu]: 'Доступ к меню администратора',
    [PermissionEnum.AdminBranding]: 'Управление брендингом',

    // Подписки (планы)
    [PermissionEnum.PlanCreate]: 'Создание плана подписки',
    [PermissionEnum.PlanGet]: 'Получение информации о плане подписки',
    [PermissionEnum.PlanGetAll]: 'Получение списка планов подписки',
    [PermissionEnum.PlanUpdate]: 'Обновление плана подписки',
    [PermissionEnum.PlanDelete]: 'Удаление плана подписки'
}
