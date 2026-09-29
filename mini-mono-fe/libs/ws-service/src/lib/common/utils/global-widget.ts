import { useHeader, useFooter } from 'betterbit-frame-pkg';

interface useGlobalWidgetParams {
  type: string;
}
export function handleGlobalWidget(params?: useGlobalWidgetParams) {
  const { type } = params!;
  const { createHeader } = useHeader();
  const componentHeader = createHeader({
    elementId: 'widget_header'
  });

  const { createFooter } = useFooter();
  const componentFooter = createFooter({
    elementId: 'widget_footer',
    props: { type: type || 'large' }
  });

  return {
    componentHeader,
    componentFooter
  };
}
