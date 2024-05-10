// server.js

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const solc = require("solc");
const cors=require("cors")
const app = express();
const PORT = process.env.PORT || 5000;
const { exec } = require('child_process');
app.use(cors())
app.use(bodyParser.json());

// Sample storage for expected output hashes
const outputHashes = {
    solidity: {
        easy: 'hash1',
        medium: 'hash2',
        hard: 'hash3'
    },
    rust: {
        easy: 'hash4',
        medium: 'hash5',
        hard: 'hash6'
    },
    motoko: {
        easy: 'hash7',
        medium: 'hash8',
        hard: 'hash9'
    }
};
function compileRustCode(code) {
    return new Promise((resolve, reject) => {
        fs.writeFile('code.rs', code, (err) => {
            if (err) {
                reject({ success: false, error: err.message });
                return;
            }
            exec(`rustc -o compiled_code code.rs`, { cwd: __dirname }, (error, stdout, stderr) => {
                if (error || stderr) {
                    reject({ success: false, error: error ? error.message : stderr });
                } else {
                    resolve({ success: true });
                }
            });
        });
    });
}

// Function to calculate hash of a file
function calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const input = fs.createReadStream(filePath);

        input.on('error', reject);

        input.on('data', (chunk) => {
            hash.update(chunk);
        });

        input.on('end', () => {
            resolve(hash.digest('hex'));
        });
    });
}

// Compile code based on language
async function compileCode(language, code) {
    if (language === 'rust') {
        try {
            await compileRustCode(code);
            const outputHash = await calculateFileHash('compiled_code');
            console.log(outputHash,'>>>>>>>')
            return { success: true, bytecode: outputHash };
        } catch (error) {
            return { success: false, error: error.error };
        }
    }
    else{
    return new Promise((resolve, reject) => {
        const input = {
            language: 'Solidity',
            sources: {
                'test.sol': {
                    content: code
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['*']
                    }
                }
            }
        };

        try {
            const output = JSON.parse(solc.compile(JSON.stringify(input)));

            // Check if compilation was successful
            if (output.errors) {
                reject({ success: false, error: output.errors[0].message });
            } else {
                const contractName = Object.keys(output.contracts['test.sol'])[0]; // Assuming only one contract is compiled
                const bytecode = output.contracts['test.sol'][contractName].evm.bytecode.object;

                // Resolve with the compiled bytecode
                resolve({ success: true, bytecode });
            }
        } catch (error) {
            reject({ success: false, error: error.message });
        }
    });}
}



// Calculate hash of output
function calculateOutputHash(output) {
    return crypto.createHash('sha256').update(output).digest('hex');
}

app.post('/submit_code', async (req, res) => {
    const { language, code, difficulty } = req.body;

    try {
        const compiledOutput = await compileCode(language, code);

        if (compiledOutput.success) {
            // Calculate hash of the compiled bytecode
            const outputHash = calculateOutputHash(compiledOutput.bytecode);

            // Compare hash with expected hash based on difficulty level
            outputHashes[language][difficulty]=outputHash
     const      expectedHash= outputHashes[language][difficulty]
            if (outputHash === expectedHash) {
                const points = { easy: 1, medium: 2, hard: 3 }[difficulty];
                res.json({ status: 'success', points });
            } else {
                res.status(200).json({ status: 'failure', error: 'Output does not match expected hash' });
            }
        } else {
            res.status(200).json({ status: 'failure', error: compiledOutput.error });
        }
    } catch (error) {
        console.error(error);
        res.status(200).json({ status: 'failure', error: error.error });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
