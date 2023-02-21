import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Octokit } from "@octokit/rest";
import { XTerm } from 'xterm-for-react'
import { FitAddon } from 'xterm-addon-fit';

function App() {
  const [repositories, setRepositories] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const xtermRef = React.useRef(null)
  // Fetch the user's repositories on component mount
  useEffect(() => {
    // You can call any method in XTerm.js by using 'xterm xtermRef.current.terminal.[What you want to call]
    xtermRef.current.terminal.writeln("Hello, World!")
}, [])

 // Fetch the workflow runs for the repository on component mount
 useEffect(() => {
  axios.get('https://api.github.com/repos/Mondher19/Build/actions/runs', {
    headers: {
      Authorization: `Bearer ${"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"}`,
    },
  })
  .then(response => {
    setWorkflowRuns(response.data.workflow_runs);

  })
  .catch(error => {
    console.log(error);
  });
}, []);


  useEffect(() => {
    axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${"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"}`,
      },
    })
    .then(response => {
      setRepositories(response.data);
    })
    .catch(error => {
      console.log(error);
    });
  }, []);

  //Artifacts 

  const [artifacts, setArtifacts] = useState([]);
  const artifactId = artifacts.data[0].id;

  useEffect(() => {
    async function fetchArtifacts() {
      const artifactId = artifacts.data[0]["id"]
      const octokit = new Octokit({
        auth: "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",
      });
     
      const { data } = await octokit.actions.listWorkflowRunArtifacts({
        owner: "Mondher19",
        repo: "Build",
        run_id: WORKFLOW_RUN_ID,
      });
      setArtifacts(data);
    }
    fetchArtifacts();
  }, ["Mondher19", "Build", WORKFLOW_RUN_ID, "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"]);


  // Fetch the branches of the selected repository
  useEffect(() => {
    if (selectedRepository) {
      axios.get(`https://api.github.com/repos/${selectedRepository.full_name}/branches`, {
        headers: {
          Authorization: `Bearer ${"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"}`,
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
      console.log(`Building ${selectedRepository.full_name}#${selectedBranch.name}`);
  
      axios.post(`https://api.github.com/repos/${selectedRepository.full_name}/actions/workflows/android-ci.yml/dispatches`, {
        ref: selectedBranch.name,
       
      }, {
        headers: {
          Authorization: `Bearer ${"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"}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })
      .then(response => {
        console.log(response);
        if (response.status === 204) {
          alert("build");
        } else {
          alert("response");
        }
      })
      .catch(error => {
        console.log("text");
        alert(error);
      });
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
      <XTerm ref={xtermRef} />
      
      <table>
        <thead>
          <tr>
           
            <th>Event</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {workflowRuns.map(workflowRun => (
            <tr key={workflowRun.id}>
              <td>{workflowRun.id}</td>
              <td>{workflowRun.event}</td>
              <td>{workflowRun.status}</td>
              <td>{workflowRun.doration}</td>

            </tr>
          ))}
        </tbody>
      </table>
      <h2>Artifacts</h2>
      <ul>
        {artifacts.map((artifact) => (
          <li key={artifact.id}>
            <a
              href={artifact.archive_download_url}
              download={`${artifact.name}.zip`}
            >
              {artifact.name}
            </a>
          </li>
        ))}
      </ul>

    </div>
    

    
  );
}

export default App;
