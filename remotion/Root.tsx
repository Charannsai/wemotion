import { Composition } from 'remotion';
import { RemotionComposition } from '@/components/renderer/Composition';
import { createDocument, createScene, createTextLayer } from '@/lib/scene-graph/defaults';

// This is a static demo document for the Remotion Studio preview.
// In a real export pipeline, the document JSON would be passed via inputProps.
const demoDocument = createDocument({
  scenes: [
    createScene({
      layers: [
        createTextLayer({
          text: {
            content: 'WeMotion',
            style: {
              fontFamily: 'Inter',
              fontSize: 120,
              fontWeight: 800,
              color: '#000000',
              lineHeight: 1,
              letterSpacing: -2,
              align: 'center',
              italic: false,
              underline: false,
              uppercase: false
            }
          },
          entryMotion: 'popIn:30:energetic',
          exitMotion: 'slideUp:15:moderate'
        })
      ]
    })
  ]
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WeMotionExport"
        component={RemotionComposition}
        durationInFrames={demoDocument.scenes.reduce((acc, s) => acc + s.durationFrames, 0)}
        fps={demoDocument.fps}
        width={demoDocument.canvasWidth}
        height={demoDocument.canvasHeight}
        defaultProps={{
          document: demoDocument,
          assetBaseUrl: '',
        }}
      />
    </>
  );
};
