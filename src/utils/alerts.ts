import Swal from 'sweetalert2';

/**
 * Shared SweetAlert2 wrappers.
 *
 * Centralised so every dialog in the app uses the same MAVER palette and
 * wording — and so the raw browser alert() calls, which can't be styled and
 * block the page, are gone.
 */
const BRAND = '#1d4ed8';
const DANGER = '#dc2626';

const base = {
  confirmButtonColor: BRAND,
  cancelButtonColor: '#64748b',
  buttonsStyling: true,
  heightAuto: false,
  customClass: { popup: 'maver-swal' },
};

/** Green tick — a save/update completed. */
export const alertSuccess = (title: string, text?: string) =>
  Swal.fire({ ...base, icon: 'success', title, text, timer: 2600, timerProgressBar: true, showConfirmButton: false });

/** Red cross — something failed. Stays until dismissed. */
export const alertError = (title: string, text?: string) =>
  Swal.fire({ ...base, icon: 'error', title, text, confirmButtonColor: DANGER, confirmButtonText: 'OK' });

/** Amber — nothing broke, but the user should read it. */
export const alertWarning = (title: string, text?: string) =>
  Swal.fire({ ...base, icon: 'warning', title, text, confirmButtonText: 'OK' });

export const alertInfo = (title: string, text?: string) =>
  Swal.fire({ ...base, icon: 'info', title, text, confirmButtonText: 'OK' });

/** Returns true only when the user explicitly confirms. */
export const confirmAction = async (
  title: string,
  text?: string,
  confirmButtonText = 'Yes, continue',
): Promise<boolean> => {
  const result = await Swal.fire({
    ...base,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
  });
  return result.isConfirmed;
};

/** Destructive confirm — red button, for deletes. */
export const confirmDelete = async (title: string, text?: string): Promise<boolean> => {
  const result = await Swal.fire({
    ...base,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: DANGER,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
  });
  return result.isConfirmed;
};

/** Small corner toast — for frequent, low-importance confirmations. */
export const toastSuccess = (title: string) =>
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title,
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
    heightAuto: false,
  });

export default Swal;
