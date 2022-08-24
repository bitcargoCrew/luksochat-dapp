/** @jsx jsx */
import { jsx, Container, Flex, Text, Heading, Box, Image } from 'theme-ui';
import TextFeature from 'components/text-feature';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import FeatureThumb from 'assets/core-feature.png';

const data = {
  title: 'Instant messaging powered by the Lusko Blockchain',

};

export default function CoreFeature() {
  return (
   <section sx={{variant: 'section.coreFeature'}}>
    <Container sx={styles.containerBox}>
      <Box sx={styles.contentBox}>
        <TextFeature 
          title={data.title}
        />
          <Box as="ul" sx={styles.list}>
            <Text as="li">
              <IoIosCheckmarkCircle />
                Communicate without any intermediary 
            </Text>
            <Text as="li">
              <IoIosCheckmarkCircle />
                Use your Lukso Universal Profile as your identity
            </Text>
             <Text as="li">
             <IoIosCheckmarkCircle />
                Keep you personal data private 
              </Text>
              <Text as="li">
              <IoIosCheckmarkCircle />
                Share messages, tokens and NFTs
              </Text>
              <Text as="li">
                <IoIosCheckmarkCircle />
                Promote your exclusive content in a simple way
              </Text>
            </Box>
          </Box>
      <Box sx={styles.thumbnail}>
        <Image src={FeatureThumb} alt="Thumbnail" />
      </Box>
    </Container>
   </section>
  );
}

const styles = {
  containerBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: ['wrap', null, null, 'nowrap'],
    pb: [0, 7, 0, null, 7],
  },
  contentBox: {
    flexShrink: 0,
    px: [0, null, '30px', 0],
    textAlign: ['center', null, null, 'left'],
    width: ['100%', '80%', null, 340, 400, 430, null, 485],
    pb: ['50px', '60px', null, 0],
    mx: ['auto', null, null, 0],
    '.description': {
      pr: [0, null, 6, 7, 6],
    },
  },
  thumbnail: {
    display: 'inline-flex',
    position: 'relative',
    mr: 'auto',
    ml: ['auto', null, null, null, 7],
    '> img': {
      position: 'relative',
      zIndex: 1,
      height: [310, 'auto'],
    },
  },
  shapeBox: {
    position: 'absolute',
    bottom: -65,
    right: -165,
    zIndex: -1,
    display: ['none', 'inline-block', 'none', null, 'inline-block'],
  },
  boostAgencies: {
    pt: ['70px', null, null, '80px', '120px', null, '130px'],
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: ['column', null, null, 'row-reverse'],
  },
  col: {
    flex: ['0 0 100%', null, null, '0 0 50%'],
  },
  image: {
    mt: ['25px', null, null, '0'],
    display: 'flex',
    marginLeft: ['0', null, null, null, 'auto'],
    marginRight: ['0', null, null, null, 'auto'],
    height: ['385px', null, null, 'auto'],
    position: 'relative',
    top: [null, null, null, '-20px', '-45px', 'auto'],
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    ml: ['25px', null, null, '0'],
    mb: ['4px'],
    mt: ['30px'],
    li: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: ['flex-start', null, null, null, null, 'flex-start'],
      fontSize: [1, null, 2, null, '18px'],
      color: 'text_secondary',
      lineHeight: [2.56],
      svg: {
        width: [17, null, null, 23],
        height: [17, null, null, 23],
        color: '#4B9F28',
        borderRadius: '50%',
        marginRight: ['10px'],
      },
    },
  },
  titleBox: {
    textAlign: ['center', null, null, 'left'],
    h3: {
      color: 'black',
      fontSize: [5, null, null, '21px', '36px', '32px', 8],
      lineHeight: [1.6, null, null, '1.5'],
      fontWeight: 'bold',
      letterSpacing: ['-0.5px', null, null, null, null, null, '-1.5px'],
    },
    p: {
      fontSize: [0, null, 2, null, '17px'],
      color: 'text_secondary',
      opacity: '.6',
      lineHeight: ['26px', null, null, 1.8, null, 2.06],
      padding: ['0 20px', null, null, '0'],
      mt: ['15px'],
    },
  },
  link: {
    color: 'primary',
    fontSize: [1, null, 2],
    display: 'inline-block',
    verticalAlign: 'middle',
    fontWeight: 'bold',
    pl: ['30px', null, null, '4px', null, '4px'],
    mt: ['5px', null, null, null, '10px'],
    svg: {
      position: 'relative',
      top: '3px',
    },
  },
  content: {
    width: '100%',
    textAlign: ['left', null, null, null, 'left'],
    pt: [null, null, null, null, null, '10px'],
    pl: [null, null, null, null, null, '60px', '140px'],
  },









};
