const deleteVendorDialog = document.getElementById('delete-vendor-dialog');
const deleteVendorButton = document.getElementById('delete-vendor-button');
const cancelDeleteVendorButton = document.getElementById(
  'cancel-delete-vendor-button'
);
const confirmDeleteVendorButton = document.getElementById(
  'confirm-delete-vendor-button'
);

const deleteVendorDialogTitle = document.getElementById(
  'delete-vendor-dialog-title'
);

const selectedVendorIds = new Set();
const vendorCheckboxes = document.querySelectorAll('input[type=checkbox]');
for (const vendorCheckbox of vendorCheckboxes) {
  vendorCheckbox.addEventListener('click', function () {
    if (this.checked) {
      selectedVendorIds.add(this.dataset.id);
    } else {
      selectedVendorIds.delete(this.dataset.id);
    }

    if (selectedVendorIds.size === 0) {
      deleteVendorButton.disabled = true;
    } else {
      deleteVendorButton.disabled = false;

      if (selectedVendorIds.size === 1) {
        const vendorName = document.querySelector(
          `input[type=checkbox][data-id="${this.dataset.id}"]`
        ).dataset.name;
        deleteVendorDialogTitle.textContent = `Delete ${vendorName}?`;
      } else {
        deleteVendorDialogTitle.textContent = 'Delete Vendors?';
      }
    }
  });
}

deleteVendorButton.onclick = () => {
  deleteVendorDialog.showModal();
};

cancelDeleteVendorButton.onclick = () => {
  deleteVendorDialog.close();
};

confirmDeleteVendorButton.onclick = async () => {
  for (const vendorId of selectedVendorIds) {
    await fetch(`/vendors/${vendorId}`, {
      method: 'DELETE',
    });
  }
  window.location.reload();
};
