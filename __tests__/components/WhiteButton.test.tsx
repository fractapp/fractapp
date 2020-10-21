import React from 'react';
import renderer from 'react-test-renderer';
import { WhiteButton, Img } from 'components';

it('Test height=20 && text="Text #1" && width=default && img=default', () => {
  const tree = renderer
    .create(<WhiteButton text="Text #1" height={20} onPress={()=>console.log("click")} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test height=40 && text="Text #2" && width=50 && img=default', () => {
  const tree = renderer
    .create(<WhiteButton text="Text #2" height={40} width={50} onPress={()=>console.log("click")} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test img=GoogleDisk', () => {
  const tree = renderer
    .create(<WhiteButton text="Text" height={40} img={Img.GoogleDisk} onPress={()=>console.log("click")} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test img=File', () => {
  const tree = renderer
    .create(<WhiteButton text="Text" height={40} img={Img.File} onPress={()=>console.log("click")} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test img=Key', () => {
  const tree = renderer
    .create(<WhiteButton text="Text" height={40} img={Img.Key} onPress={()=>console.log("click")} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test img=Copy', () => {
  const tree = renderer
    .create(<WhiteButton text="Text" height={40} img={Img.Copy} onPress={()=>console.log("click")} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});