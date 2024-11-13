import core_package_info from '@sparks-notation/core/package.json'
import desktop_package_info from '../../../package.json'

export default {
  core: core_package_info.version,
  app: desktop_package_info.version
}
