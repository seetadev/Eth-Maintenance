import { task } from 'hardhat/config';

task('kovan-verify', 'Prints the list of accounts').setAction(async ({}, hre) => {
  await hre.run("verify:verify", {
    address: "0x8806Cdb4b2a77C76C5e62cCd576E3Fd1268C262D",
    constructorArguments: [
    ],
  });

  await hre.run("verify:verify", {
    address: "0x64Cd0BA7e51736679e45e2Bc5Ef44d7094f5719c",
    constructorArguments: [
    ],
  });


  await hre.run("verify:verify", {
    address: "0x9c1dCc4DdA69f254846a1EA26e01c80F7d5541a3",
    constructorArguments: [
    ],
  });

  });
  