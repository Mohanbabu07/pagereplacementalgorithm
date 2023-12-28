function pageFaultsFIFO(pages, n, capacity) {
  console.log('WE are in FIFO');

  let frame = Array(capacity).fill(-1);
  let page_faults = 0;

  // Create an array to store the table data
  let tableData = [];

  for (let i = 0; i < n; i++) {
      let prev_page_faults = page_faults;
      let page = pages[i];

      if (!frame.includes(page)) {
          page_faults++;

          if (frame.includes(-1)) {
              // If there's an empty frame, use it
              frame[frame.indexOf(-1)] = page;
          } else {
              // Replace the oldest page (FIFO)
              frame.shift();
              frame.push(page);
          }
      }

      // Create a row for the table with the data for this step
      let rowData = [i, page, ...frame, prev_page_faults === page_faults ? '✓' : '✗'];
      tableData.push(rowData);
  }

  // Build the table with results
  buildTable(tableData);

  return page_faults;
}
function pageFaultsLRU(pages, n, capacity) {
  console.log('WE are in LRU');

  let frame = Array(capacity).fill(-1);
  let page_faults = 0;

  // Create an array to store the table data
  let tableData = [];

  // Create an array to track the most recent use of pages in the frame
  let lru = Array(capacity).fill(0);

  for (let i = 0; i < n; i++) {
    let prev_page_faults = page_faults;
    let page = pages[i];

    if (!frame.includes(page)) {
      page_faults++;

      if (frame.includes(-1)) {
        // If there's an empty frame, use it
        const emptyIndex = frame.indexOf(-1);
        frame[emptyIndex] = page;
        lru[emptyIndex] = i;
      } else {
        // Find the least recently used page in the frame
        const lruIndex = lru.indexOf(Math.min(...lru));
        frame[lruIndex] = page;
        lru[lruIndex] = i;
      }
    } else {
      // Update the LRU tracking for the existing page
      const pageIndex = frame.indexOf(page);
      lru[pageIndex] = i;
    }

    // Create a row for the table with the data for this step
    let rowData = [i, page, ...frame, prev_page_faults === page_faults ? '✓' : '✗'];
    tableData.push(rowData);
  }

  // Build the table with results
  buildTable(tableData);

  return page_faults;
}


  function pageFaultsOptimal(pages, n, capacity) {
    console.log('WE are in Optimal');
  
    let frame = Array(capacity).fill(-1);
    let page_faults = 0;
  
    // Create an array to store the table data
    let tableData = [];
  
    for (let i = 0; i < n; i++) {
      let prev_page_faults = page_faults;
      let page = pages[i];
  
      if (!frame.includes(page)) {
        page_faults++;
  
        if (frame.includes(-1)) {
          // If there's an empty frame, use it
          frame[frame.indexOf(-1)] = page;
        } else {
          // Find the page that won't be used for the longest time
          let farthestIndex = -1;
          let maxDistance = -1;
  
          for (let j = 0; j < capacity; j++) {
            let nextPageIndex = pages.slice(i + 1).indexOf(frame[j]);
            if (nextPageIndex === -1) {
              farthestIndex = j;
              break;
            } else if (nextPageIndex > maxDistance) {
              maxDistance = nextPageIndex;
              farthestIndex = j;
            }
          }
  
          frame[farthestIndex] = page;
        }
      }
  
      // Create a row for the table with the data for this step
      let rowData = [i, page, ...frame, prev_page_faults === page_faults ? '✓' : '✗'];
      tableData.push(rowData);
    }
  
    // Build the table with results
    buildTable(tableData);
  
    return page_faults;
  }
  

  function pushData() {
    let summaryCheck = document.querySelector('#Summary').checked;
    if (!summaryCheck) {
      const part1 = document.querySelector('.part1');
      part1.innerHTML = '';
    }
    let pra = document.querySelector('#pra').value;
    pra = pra.toString();
  
    pages = [];
    let inputText = document.getElementById('references').value;
    let frames = Number(document.querySelector('.noofframes').value);
    inputText = inputText.split(' ');
    for (let i = 0; i < inputText.length; i++) {
      inputText[i] = Number(inputText[i]);
      pages.push(Number(inputText[i]));
    }
  
    let faults = 0;
    if (pra === 'LRU') {
      faults = pageFaultsLRU(pages, pages.length, frames);
    } else if (pra === 'FIFO') {
      faults = pageFaultsFIFO(pages, pages.length, frames);
    } else if (pra === 'Optimal') {
      faults = pageFaultsOptimal(pages, pages.length, frames);
    } else {
      const part2 = document.querySelector('.part2');
      document.querySelector('.part1').innerHTML = '';
      document.querySelector('.part3').innerHTML = '';
      part2.innerHTML = '';
      part2.innerHTML = `<h1 class='opt'><b>Feature Not Available Yet...</b></h1>`;
      return;
    }
  
    buildSchedule(frames, pra, pages, faults, summaryCheck);
  }
  function buildSchedule(frames, str, pages, faults, summaryCheck) {
    /* Part 1 - Summary */
    if (summaryCheck) {
        const part1 = document.querySelector('.part1');
        part1.innerHTML = '';
        const head = document.createElement('div');
        head.id = 'head';
        head.innerHTML = `<h2>Summary - ${str} Algorithm</h2>`;
        part1.appendChild(head);
        const base = document.createElement('div');
        base.id = 'base';
        base.innerHTML = `
            <ul>
                <li>Total frames: ${frames}</li>
                <li>Algorithm: ${str}</li>
                <li>Reference string length: ${pages.length} references</li>
                <li>String: ${pages}</li>
            </ul>`;
        part1.appendChild(base);
    }

    /* Part 2 - Statistics */
    const count = {};
    pages.forEach((element) => {
        count[element] = (count[element] || 0) + 1;
    });
    const distinctPages = Object.keys(count).length;
    
    // Calculate hit and fault rates as percentages
    const totalReferences = pages.length;
    const hits = totalReferences - faults;
    const hitRate = ((hits / totalReferences) * 100).toFixed(2);
    const faultRate = ((faults / totalReferences) * 100).toFixed(2);

    const part3 = document.querySelector('.part3');
    part3.innerHTML = '';
    const calcs = document.createElement('div');
    calcs.innerHTML = `<ul>
        <li>Total references: ${totalReferences}</li>
        <li>Hits: ${hits}</li>
        <li>Faults: ${faults}</li>
        <li><b>Hit rate:</b> ${hitRate}%</li>
        <li><b>Fault rate:</b> ${faultRate}%</li>
    </ul>`;
    part3.appendChild(calcs);
}
function buildTable(arr) {
  const part2 = document.querySelector('.part2');
  part2.innerHTML = '';

  const numRows = arr.length;
  const numCols = arr[0].length;

  var mytable = '<table>';
  for (let i = 0; i < numRows; i++) {
      mytable += '<tr>';
      for (let j = 0; j < numCols; j++) {
          if (arr[i][j] === '✓') {
              mytable += `<th class="c${j} hit">` + arr[i][j] + '</th>';
          } else if (arr[i][j] === '✗') {
              mytable += `<th class="c${j} miss">` + arr[i][j] + '</th>';
          } else {
              mytable += `<th class="c${j}">` + arr[i][j] + '</th>';
          }
      }
      mytable += '</tr>';
  }
  mytable += '</table';

  part2.innerHTML = mytable;
}
