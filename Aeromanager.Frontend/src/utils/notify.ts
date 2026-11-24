import { sileo } from 'sileo';

export function notifySuccess(title: string, description?: string) {
  return sileo.success({
    title,
    ...(description ? { description } : {})
  });
}

export function notifyError(title: string, description?: string) {
  return sileo.error({
    title,
    duration: 5500,
    ...(description ? { description } : {})
  });
}

export function notifyWarning(title: string, description?: string) {
  return sileo.warning({
    title,
    duration: 5000,
    ...(description ? { description } : {})
  });
}

export function notifyInfo(title: string, description?: string) {
  return sileo.info({
    title,
    ...(description ? { description } : {})
  });
}

export function notifyUndo(
  title: string,
  description: string,
  onUndo: () => void | Promise<void>
) {
  return sileo.action({
    title,
    description,
    duration: 6000,
    button: {
      title: 'Deshacer',
      onClick: () => {
        void onUndo();
      }
    }
  });
}

export { sileo };
