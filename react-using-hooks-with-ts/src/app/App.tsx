import React, { useEffect, createRef, useState } from 'react';

import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import { Color } from 'three';
import {
  Alert,
  Backdrop,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  CircularProgress,
  CssBaseline,
  IconButton,
  Toolbar,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Typography,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { FolderOpenOutlined, CompareArrowsSharp, HelpOutline, GitHub, Margin } from '@mui/icons-material';
import FilterListIcon from '@mui/icons-material/FilterList';
//import Checkbox from "@material-ui/core/Checkbox";
import { Checkbox } from '@mui/material';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormHelperText from "@material-ui/core/FormHelperText";
import { withStyles } from "@material-ui/core/styles";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MouseIcon from '@mui/icons-material/Mouse';

import { IfcViewerAPI } from 'web-ifc-viewer';
import { IfcContainer } from './IfcContainer';
import {
	IFCWALLSTANDARDCASE,
	IFCSLAB,
	IFCDOOR,
	IFCWINDOW,
	IFCFURNISHINGELEMENT,
	IFCMEMBER,
	IFCPLATE,
} from 'web-ifc';

const drawerWidth = 340;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

function App() {
  const theme = useTheme();

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [isClippingPaneSelected, setClippingPaneSelected] = useState(false);
  const [isVisibilitySelected, setVisibilitySelected] = useState(false);
  const [isSelectioned, setSelection] = useState(false);
  const [isLoading, setLoading] = useState(false)

  const ifcContainer = createRef<HTMLDivElement>();
  const [viewer, setViewer] = useState<IfcViewerAPI>();
  const [ifcLoadingErrorMessage, setIfcLoadingErrorMessage] = useState<string>();

  useEffect(() => {
    if (ifcContainer.current) {
      const container = ifcContainer.current;
      const ifcViewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });
      ifcViewer.addAxes();
      ifcViewer.addGrid();
      ifcViewer.IFC.loader.ifcManager.applyWebIfcConfig({
        COORDINATE_TO_ORIGIN: true,
        USE_FAST_BOOLS: false
      });
      setViewer(ifcViewer);
    }
  }, []);

  const ifcOnLoad = async (e) => {
    const file = e && e.target && e.target.files && e.target.files[0];
    if (file && viewer) {

      // reset
      setIfcLoadingErrorMessage('');
      setLoading(true);

      // load file
      const model = await viewer.IFC.loadIfc(file, true, ifcOnLoadError);
      await viewer.shadowDropper.renderShadow(model.modelID);

      // update information
      setSnackbarOpen(true);
      setLoading(false)
    }
  };

  const ifcOnLoadError = async (err) => {
    setIfcLoadingErrorMessage(err.toString());
  };

  const toggleClippingPlanes = () => {
    if (viewer) {
      viewer.toggleClippingPlanes();
      if (viewer.clipper.active) {
        setClippingPaneSelected(true);
      } else {
        setClippingPaneSelected(false);
      }
    }
  }

  const toggleVisibility = () => {
    if (viewer) {
      if (viewer.clipper.active) {
        setVisibilitySelected(true);
      } else {
        setVisibilitySelected(false);
      }
    }
  }

  const toggleSelection = () => {
    if (viewer) {
      //viewer.prePickIfcItem();
      if (/*isSelectioned === false*/   viewer.IFC.selector.selection) {
     //   viewer.IFC.selector.unPrepickIfcItems();
        setSelection(true);
        console.log("clique")
      } else {
        //viewer.IFC.selector.prePickIfcItem();
        setSelection(false);
      }
    }
  }

  const filterBool = () => {
    if (isShown === true) {
      setIsShown(false)
    }
    if (isShown === false) {
      setIsShown(true)
    }
  }
  
  const [isShown, setIsShown] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [checked, setChecked] = React.useState(true);
  const checkList = ["Apple", "Banana", "Tea", "Coffee"];

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  // Checkbox Group
  const [categories, setcategories] = React.useState({
    IFCWALLSTANDARDCASE: false,
    IFCSLAB: false,
    IFCDOOR: false
  });

  const { IFCWALLSTANDARDCASE, IFCSLAB, IFCDOOR } = categories;

  const handleCategoriesChange = (event) => {
    setcategories({ ...categories, [event.target.name]: event.target.checked });
  };

  const CustomColorCheckbox = withStyles({
    root: {
      color: "#13c552",
      "&$checked": {
        color: "#13c552"
      }
    },
    // formControl: {
    //   'label + &': {
    //     marginTop: '2px',
    //   },
    //   '& ~ p': {
    //     marginTop: '4px',
    //     marginLeft: '8px',
    //   },
    // },
    checked: {}
  })((props) => <Checkbox color="default" {...props} />);

  
  const [isVisible, setVisibility] = useState(false);

  const handleIconClickVisibility = () => {
    if (isVisible === false)
    setVisibility(true)

    if(isVisible === true)
    setVisibility(false)
   // change <AddCircleIcon /> to <BlockIcon /> at "id"
}

const test = ()  => {
  console.log("OVdb")
 // change <AddCircleIcon /> to <BlockIcon /> at "id"
}
  
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position='fixed' open={isDrawerOpen}>
          <Toolbar>
            <IconButton
              color='inherit'
              aria-label='open drawer'
              onClick={() => setDrawerOpen(true)}
              edge='start'
              sx={{
                marginRight: '36px',
                ...(isDrawerOpen && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant='h6' noWrap component='div'>
              Ifc.js React MUI Viewer
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant='permanent' open={isDrawerOpen}>
          <DrawerHeader>
            <IconButton onClick={() => {setDrawerOpen(false), setIsShown(false)} }>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <input
              type='file'
              id='file'
              accept='.ifc'
              onChange={ifcOnLoad}
              style={{ display: 'none' }}
            />
            <label htmlFor='file'>
              <ListItem button key={'openFile'}>
                <ListItemIcon>
                  <FolderOpenOutlined />
                </ListItemIcon>
                <ListItemText primary={'Open File'} />
              </ListItem>
            </label>
            </List>
            <List>
            <ListItem button key={'showPlane'} onClick={() => toggleClippingPlanes()}
              selected={isClippingPaneSelected}>
              <ListItemIcon>
                <CompareArrowsSharp />
              </ListItemIcon>
              <ListItemText primary={'Clipping Planes'} />
            </ListItem>
            </List>
            <List>
            <ListItem button key={'filter'} onClick={() => {filterBool(), setDrawerOpen(true)}} 
              // onMouseEnter={() => setIsShown(true)}
              // onMouseLeave={() => setIsShown(false)}
              >
              <ListItemIcon>
                <FilterListIcon />
              </ListItemIcon>
              <ListItemText primary={'Filter'} />
            </ListItem>
            {isShown && (
            //   <div className="checkList">
            //   <div className="title">Your CheckList:</div>
            //   <div className="list-container">
            //     {checkList.map((item, index) => (
            //       <div key={index}>
            //         <span>{item}</span>
            //       </div>
            //     ))}
            //   </div>
            // </div>
            <div>

             <FormControl component="fieldset">
              <FormLabel>Filter objects
              </FormLabel>
              <FormGroup>
                <FormControlLabel

                  control={
                    <Checkbox
                      sx={{
                        marginLeft: '50px'
                      }}
                      checked={IFCWALLSTANDARDCASE}
                      onChange={handleCategoriesChange}
                      name="IFCWALLSTANDARDCASE"
                    />
                  }
                  
                  label="IFCWALLSTANDARDCASE"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{
                        marginLeft: '50px'
                      }}
                      checked={IFCSLAB}
                      onChange={handleCategoriesChange}
                      name="IFCSLAB"
                    />
                  }
                  label="IFCSLAB"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{
                        marginLeft: '50px'
                      }}
                      checked={IFCDOOR}
                      onChange={handleCategoriesChange}
                      name="IFCDOOR"
                    />
                  }
                  label="IFCDOOR"
                />
              </FormGroup>
            </FormControl> 
          </div>
          )}
          </List>
          <List>
            <ListItem button key={'visibilityByObject'} onClick={() => {test(), handleIconClickVisibility(), toggleVisibility()} }
              selected={isVisibilitySelected}>
              <ListItemIcon>
                {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon /> }
              </ListItemIcon>
              <ListItemText primary={'Visibility by object'} />
            </ListItem>
            </List>
            {isVisible && (
              <div> oui</div>
            )
            }
            <List>
            <ListItem button key={'showSelection'} onClick={() => toggleSelection()}
              selected={isSelectioned}>
              <ListItemIcon>
                <MouseIcon />
              </ListItemIcon>
              <ListItemText primary={'Selection'} />
            </ListItem>
            </List>
          <Divider />
          <List>
            <ListItem button key={'About'} onClick={() => setDialogOpen(true)} >
              <ListItemIcon>
                <HelpOutline />
              </ListItemIcon>
              <ListItemText primary={'About'} />
            </ListItem>
          </List>
        </Drawer>
        <Box component='main' sx={{ flexGrow: 1 }}>
          <DrawerHeader />
          <IfcContainer
            ref={ifcContainer}
            viewer={viewer} />
        </Box>
      </Box>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color='inherit' />
      </Backdrop>

      <Dialog onClose={() => setDialogOpen(false)} open={isDialogOpen}>
        <DialogTitle>About</DialogTitle>
        <DialogContent>
          <List dense>
            <ListItem>
              <ListItemText
                primary='right-click' secondary='Create a Plan'
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary='double-click' secondary='Pick an Item'
              />
            </ListItem>
          </List>
          <Link href='https://github.com/IFCjs' underline='hover' target='_blank'>
            Join us on GitHub
          </Link>
          <GitHub />
        </DialogContent>
      </Dialog>

      <Snackbar open={isSnackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        {ifcLoadingErrorMessage ?
          <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
            Error loading the IFC File. Check the console for more information.
          </Alert>
          : <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
            IFC File loaded successfully!
          </Alert>}
      </Snackbar>
    </>
  );
}

export { App };
