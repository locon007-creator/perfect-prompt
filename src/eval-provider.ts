import { generate } from './compiler'; export default async function ({vars}:{vars:{idea:string}}){return generate(vars.idea)}
