export function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  url?: string
  // children?,
  // type?: 'group'
) {
  return {
    key,
    icon,
    label,
    url
  };
}
