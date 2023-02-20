import React, { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";
import { makeStyles } from '@material-ui/core/styles';
import CodeIcon from '@material-ui/icons/Code';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Button,
  
} from '@material-ui/core';

const octokit = new Octokit({
  auth: "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",
});

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  list: {
    maxHeight: 500,
    overflow: 'auto',
    flexGrow: 1,
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 1000,
    minHeight: 1000,
  },
  modalContent: {
    backgroundColor: theme.palette.background.paper,
    border: '10px solid #0d3c73',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    minWidth: 1000,
    minHeight: 1000,
  },
  closeButton: {
    marginTop: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  listItem: {
    borderBottom: '2px solid #0d3c73',
    '&:hover': {
      backgroundColor: '#0d3c73',
      cursor: 'pointer',
    },
  },
  listItemText: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 500,
  },
  formControl: {
    minWidth: 150,
    marginRight: theme.spacing(2),
  },
}));

function App() {
  const handleCloseBranchesDialog = () => {
    setOpen(false);
  };
  
  const handleOpenBranchesDialog = (repoFullName) => {
    // code to handle opening the branches dialog for the given repository
  };
  const classes = useStyles();
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [open, setOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchRepos() {
      try {
        const { data } = await octokit.request("GET /user/repos", {});
        setRepos(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchRepos();
  }, []);
  useEffect(() => {
    async function fetchBranches() {
      if (selectedRepo) {
        setIsLoading(true);
        try {
          const { data } = await octokit.request(
            `GET /repos/${selectedRepo}/branches`,
            {}
          );
          setBranches(data);
          setOpen(true);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setOpen(false);
      }
    }
    fetchBranches();
  }, [selectedRepo]);
  
  function handleSortByChange(event) {
    setSortBy(event.target.value);
  }
  
  function handleSearchQueryChange(event) {
    setSearchQuery(event.target.value);
  }

  function handleClose() {
    setOpen(false);
  }

  function sortRepos(repos) {
    return [...repos].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'stars') {
        return b.stargazers_count - a.stargazers_count;
      } else if (sortBy === 'forks') {
        return b.forks_count - a.forks_count;
      }
    });
  }

  function filterRepos(repos) {
    if (searchQuery === '') {
      return repos;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return repos.filter(repo => {
      return repo.name.toLowerCase().includes(lowerCaseQuery) ||
             repo.description.toLowerCase().includes(lowerCaseQuery) ||
             repo.language.toLowerCase().includes(lowerCaseQuery);
    });
  }

  const sortedRepos = sortRepos(repos);
  const filteredRepos = filterRepos(sortedRepos);

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper} style={{ backgroundColor: '#0d47a1' }}>
            <Typography variant="h3" className={classes.title} style={{ color: '#fff' }}>
              Your  Repositories
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper} style={{ backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                
              </div>
              <div>
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  style={{ marginRight: 8 ,  minWidth: 800 }}
                 
                  
                />
                <FormControl>
                  <InputLabel id="sort-by-label">Sort by</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    value={sortBy}
                    onChange={handleSortByChange}
                    style={{ minWidth: 200 }}
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="stars">Stars</MenuItem>
                    <MenuItem value="forks">Forks</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            {isLoading ? (
              <CircularProgress />
            ) : (
              <List className={classes.list}>
                {filteredRepos.map((repo) => (
                  <ListItem
  button
  key={repo.id}
  onClick={() => setSelectedRepo(repo.full_name)}
  selected={selectedRepo === repo.full_name}
>
  <ListItemText primary={repo.full_name} />
  <ListItemSecondaryAction>
    <IconButton onClick={() => handleOpenBranchesDialog(repo.full_name)}>
      <CodeIcon />
    </IconButton>
  </ListItemSecondaryAction>
</ListItem>
))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Dialog open={open} onClose={handleCloseBranchesDialog}>
    <DialogTitle>Branches</DialogTitle>
    <DialogContent>
      <List>
        {branches.map((branch) => (
          <ListItem button key={branch.name}>
            <ListItemText primary={branch.name} />
          </ListItem>
        ))}
      </List>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseBranchesDialog} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
</Container>
);
}
export default App;


