/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Container, Grid } from 'theme-ui';
import SectionHeader from '../components/section-header';
import FeatureCardColumn from 'components/feature-card-column.js';
import Performance from 'assets/key-feature/performance.svg';
import Partnership from 'assets/key-feature/partnership.svg';
import Subscription from 'assets/key-feature/subscription.svg';
import Support from 'assets/key-feature/support.svg';

const data = [
  {
    id: 1,
    imgSrc: Performance,
    altText: 'Connect your Universal Profile',
    title: 'Connect your Universal Profile',
    text:
      'Seamlessly connect your universal Profile as your digital identity.',
  },
  {
    id: 2,
    imgSrc: Partnership,
    altText: 'Communicate via the Lukso Blockchain',
    title: 'Communicate via the Lukso Blockchain',
    text:
      'Peer-to-peer message transfer and content sharing.',
  },
  {
    id: 3,
    imgSrc: Subscription,
    altText: 'Create your personal community',
    title: 'Create your personal community',
    text:
      'Invite friends, create groupchats, and acces your chat history.',
  },
  {
    id: 4,
    imgSrc: Support,
    altText: 'Access the new creative economy',
    title: 'Access the new creative economy',
    text:
      'Transfer tokens, share NFTs, and collaborate with the community.',
  },
];

export default function KeyFeature() {
  return (
    <section sx={{ variant: 'section.keyFeature' }} id="feature">
      <Container>
        <SectionHeader
          slogan="Explore the Bitvia Chat DApp"
          title="Meet the features"
        />

        <Grid sx={styles.grid}>
          {data.map((item) => (
            <FeatureCardColumn
              key={item.id}
              src={item.imgSrc}
              alt={item.altText}
              title={item.title}
              text={item.text}
            />
          ))}
        </Grid>
      </Container>
    </section>
  );
}

const styles = {
  grid: {
    width: ['100%', '80%', '100%'],
    mx: 'auto',
    gridGap: [
      '35px 0',
      null,
      '40px 40px',
      '50px 60px',
      '30px',
      '50px 40px',
      '55px 90px',
    ],
    gridTemplateColumns: [
      'repeat(1,1fr)',
      null,
      'repeat(2,1fr)',
      null,
      'repeat(4,1fr)',
    ],
  },
};