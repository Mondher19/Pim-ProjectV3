import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [repositories, setRepositories] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Fetch the user's repositories on component mount
  useEffect(() => {
    axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_GITHUB_ACCESS_TOKEN}`,
      },
    })
    .then(response => {
      setRepositories(response.data);
    })
    .catch(error => {
      console.log(error);
    });
  }, []);

  // Fetch the branches of the selected repository
  useEffect(() => {
    if (selectedRepository) {
      axios.get(`https://api.github.com/repos/${selectedRepository.full_name}/branches`, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_GITHUB_ACCESS_TOKEN}`,
        },
      })
      .then(response => {
        setBranches(response.data);
      })
      .catch(error => {
        console.log(error);
      });
    }
  }, [selectedRepository]);

  const handleRepositoryChange = (event) => {
    const repository = repositories.find(r => r.full_name === event.target.value);
    setSelectedRepository(repository);
    setSelectedBranch(null);
  }

  const handleBranchChange = (event) => {
    const branch = branches.find(b => b.name === event.target.value);
    setSelectedBranch(branch);
  }

  const handleBuildClick = () => {
    if (selectedBranch) {
      // Run the build command using the selected branch
      console.log(`Building ${selectedRepository.full_name}#${selectedBranch.name}`);
    }
  }

  return (
    <div>
      <h1>Build GitHub Branch</h1>

      <label htmlFor="repository-select">Repository:</label>
      <select id="repository-select" onChange={handleRepositoryChange}>
        <option value="">Select a repository</option>
        {repositories.map(repository => (
          <option key={repository.id} value={repository.full_name}>{repository.full_name}</option>
        ))}
      </select>

      {selectedRepository && (
        <div>
          <label htmlFor="branch-select">Branch:</label>
          <select id="branch-select" onChange={handleBranchChange}>
            <option value="">Select a branch</option>
            {branches.map(branch => (
              <option key={branch.name} value={branch.name}>{branch.name}</option>
            ))}
          </select>

          {selectedBranch && (
            <div>
              <p>Selected branch: {selectedBranch.name}</p>
              <button onClick={handleBuildClick}>Build</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
