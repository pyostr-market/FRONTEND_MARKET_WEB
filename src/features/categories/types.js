/**
 * @typedef {Object} Manufacturer
 * @property {number} id
 * @property {string} name
 * @property {string|null} description
 */

/**
 * @typedef {Object} CategoryImage
 * @property {number} upload_id
 * @property {string} image_url
 */

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {string|null} description
 * @property {CategoryImage|null} image
 * @property {number|null} parent_id
 * @property {Manufacturer} manufacturer
 * @property {Category[]} children
 */

/**
 * @typedef {Object} CategoryTreeResponse
 * @property {boolean} success
 * @property {{total: number, items: Category[]}} data
 * @property {any} error
 */
