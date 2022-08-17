/** @jsx jsx */
import { jsx, Box, Container, Image, Text } from 'theme-ui';
import { Link } from 'components/link';
import Logo from 'components/logo';
import data from './footer.data';
import FooterLogo from 'assets/logo.svg';

export default function Footer() {
  return (
    <footer
      sx={{
        variant: 'layout.footer',
        backgroundColor: '#fff',
      }}
    >
      <Container
        sx={{
          variant: 'layout.toolbar',
          justifyContent: ['center', null, null, 'space-between'],
          flexDirection: ['column', null, null, null, 'row'],
          paddingTop: [30, 40],
          paddingBottom: [30, 65],
        }}
      >
        <Box sx={styles.left}>
          <Logo />
          <Text as="p"> {new Date().getFullYear()}  All right reserved - Design by bitiva 
          </Text>

          <Text as="p">  </Text>
          <a
          href="https://drive.google.com/file/d/1YjJ3eT58UQPuftlS1WU9JYmdJJjbc-zI/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer">  
           <header className='header'></header>
          <div>  Imprint </div>
        </a>
      
     
        <Text as="p">  </Text>
        <a
          href="https://drive.google.com/file/d/1GzDDm9fOMB56ALTcum4QDMEWNHQsxDG0/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer">  
          <header className='header'></header>
          <div > Privacy Policy </div>
          </a>


        </Box>

      </Container>
    </footer>
  );
}

const styles = {
  footer: {
    footerBottomArea: {
      borderTop: '1px solid',
      borderTopColor: 'border_color',
      display: 'flex',
      pt: [7, null, 8],
      pb: ['40px', null, '100px'],
      textAlign: 'center',
      flexDirection: 'column',
    },
    menus: {
      mt: [3, 4],
      mb: 2,
      nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
      },
    },

    link: {
      fontSize: [1, '15px'],
      color: 'text',
      fontWeight: '400',
      mb: 2,
      cursor: 'pointer',
      transition: 'all 0.35s',
      display: 'block',
      textDecoration: 'none',
      lineHeight: [1.5, null, 1.8],
      px: [2, null, 4],
      ':hover': {
        color: 'primary',
      },
    },
    copyright: {
      fontSize: [1, '15px'],
      width: '100%',
    },
  },
};
