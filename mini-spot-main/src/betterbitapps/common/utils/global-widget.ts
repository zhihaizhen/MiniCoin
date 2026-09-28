import { useHeader, useFooter } from 'betterbit-frame-pkg';

interface GlobalWidgetProps {
  type: string;
}
export function handleGlobalWidget(params?: GlobalWidgetProps) {
  const { type } = params!;
  const { createHeader } = useHeader();
  const componentHeader = createHeader({
    elementId: 'widget_header',
  });

  const { createFooter } = useFooter();
  const componentFooter = createFooter({
    elementId: 'widget_footer',
    props: { type: type || 'large' },
  });

  return {
    componentHeader,
    componentFooter,
  };
}
