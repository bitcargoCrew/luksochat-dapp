import React from 'react';
import { Flex, Box, Container, Grid, Button, Input, Heading, Text } from 'theme-ui';
import { useState } from 'react';
import Image from 'components/image';
import Link from 'next/link'


import Play from 'components/icons/play';
import dynamic from 'next/dynamic';
// import ModalVideo from 'react-modal-video';

import img1 from 'assets/partner-1-1.png';




const ModalVideo = dynamic(
  () => {
    return import('react-modal-video');
  },
  { ssr: false }
);

import bannerImg from 'assets/banner-image-1-1.png';

const Banner = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const handleClick = (e) => {
    e.preventDefault();
    setVideoOpen(true);
  };



  return (
    <Box sx={styles.banner} id="banner">
      <Container sx={styles.container}>
        <Grid sx={styles.grid}>
          <Box sx={styles.content}>
            <Heading as="h3">
              Bitvia a new way to communicate in the creative economy
            </Heading>
            <Text as="p">
              Tired of using Discord? Concerned about privacy in WhatsApp? Use BitVia, the new way to communicate with your community


            </Text>
            <Box as="form" sx={styles.form}>
              <Box as="label" htmlFor="subscribe" variant="styles.srOnly">
                subscribe
              </Box>
        <div sx={styles.content}>
          <Flex sx={styles.buttonGroup}>
            <Link href="/chat">
              <Button>Go to App</Button>
            </Link>
          </Flex>
        </div>
        <div sx={styles.content}>
          <Flex sx={styles.buttonGroup}>
            <Link href="https://universalprofile.cloud/create">
              <Button>Create Profile</Button>
            </Link>
          </Flex>
        </div>
            </Box>
            <Box sx={styles.partner}>
              <Text as="span">Powered by</Text>
              <Box as="div">
                <Image src={img1} alt="" />
              </Box>
            </Box>
          </Box>
          <Box sx={styles.image}>
            <Image src={bannerImg} alt="" />
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

export default Banner;

const styles = {
  banner: {
    pt: ['110px', null, null, null, '150px', '200px'],
    pb: ['50px', null, null, null, '60px', null, '0'],
    backgroundColor: '#F6F8FB',
    overflow: 'hidden',
  },
  container: {
    width: [null, null, null, null, null, null, '1390px'],
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: ['1fr', null, null, '1fr 1fr'],
    gridGap: '0',
  },






  
  content: {
    h3: {
      color: 'black',
      fontWeight: 'bold',
      lineHeight: [1.39],
      letterSpacing: ['-.7px', '-1.5px'],
      mb: ['15px', null, null, null, '20px'],
      width: ['100%'],
      maxWidth: ['100%', null, null, '90%', '100%', '540px'],
      fontSize: [6, null, null, '36px', null, '55px', 9],
    },
    p: {
      fontSize: [1, null, null, 2, null, 3],
      lineHeight: ['26px', null, null, null, 2.33],
      color: 'text_secondary',
      mb: ['20px', null, null, null, null, '30px'],
      width: ['100%'],
      maxWidth: ['100%', null, null, null, null, '410px'],
      br: {
        display: ['none', null, null, null, 'inherit'],
      },
    },
  },
  form: {
    mb: ['30px', null, null, null, null, '60px'],
    display: ['flex'],
    input: {
      borderRadius: ['4px'],
      backgroundColor: '#fff',
      width: ['240px', null, null, null, '315px', null, '375px'],
      height: ['45px', null, null, '55px', null, null, '65px'],
      padding: ['0 15px', null, null, '0 25px'],
      fontSize: [1, null, null, 2],
      border: 'none',
      outline: 'none',
      boxShadow: '0px 10px 50px rgba(48, 98, 145, 0.08)',
    },
    button: {
      fontSize: [1, null, null, null, 2, 'px'],
      borderRadius: ['4px'],
      padding: ['0 15px'],
      ml: ['10px'],
      width: ['auto', null, null, null, '140px'],
      height: ['45px', null, null, '55px', null, null, '55px'],
    },
  },
  image: {
    img: {
      display: 'flex',
      mixBlendMode: 'darken',
      position: 'relative',
      top: ['0', null, null, null, null, '-40px'],
      maxWidth: ['100%', null, null, null, null, null, 'none'],
    },
  },
  partner: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    mb: ['40px'],
    '> div + div': {
      ml: ['10px', null, null, '20px', null, '10px'],
    },
    img: {
      display: 'flex',
    },
    span: {
      fontSize: [1, null, null, null, 2],
      color: '#566272',
      lineHeight: [1],
      opacity: 0.6,
      display: 'block',
      mb: ['20px', null, null, null, '0px'],
      mr: [null, null, null, null, '20px'],
      flex: ['0 0 100%', null, null, null, '0 0 auto'],
    },
  },








  
};

