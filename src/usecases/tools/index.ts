export const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const isObjectEmpty = (object: Object) => {
  return Object.keys(object).length === 0;
};
