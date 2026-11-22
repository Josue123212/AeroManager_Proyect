import { useLocation, useNavigate } from 'react-router-dom';

export function resolveScopedPath(currentPathname: string, targetPath: string): string {
  if (
    currentPathname.startsWith('/superadmin/ver/') &&
    (targetPath.startsWith('/admin/') ||
      targetPath.startsWith('/operador/') ||
      targetPath.startsWith('/counter/'))
  ) {
    return `/superadmin/ver${targetPath}`;
  }
  return targetPath;
}

export function useScopedNavigate() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (targetPath: string) => {
    navigate(resolveScopedPath(pathname, targetPath));
  };
}
