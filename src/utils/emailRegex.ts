export const EMAIL_REGX: RegExp =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/

export const EMAIL_REGX_Except_Null: RegExp =
  /^$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/

export const NAME_REGX: RegExp = /^[\p{L}][\p{L}\s]*$/u

export const PHONE_REGX: RegExp = /^923\d{9}$|^03\d{9}$/
export const ZIP_CODE_REGX: RegExp = /^\d{5}(-\d{4})?$/
