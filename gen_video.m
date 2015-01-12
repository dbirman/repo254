function gen_video( fname, backgroundFile, showBackground )
%GEN_VIDEO Generate a 5s video 
%   
writer = VideoWriter(fname);

img = imread(backgroundFile);

length = [33 34 33]; % Background changes every TWO, discs move every THREE

% get a length in frames
len = randi(90) + 90;

lcounter = 1; % tracks what length we should have
bchange = 1; % tracks whether we should change the background
dchange = 1; % tracks whether we should move the discs

discLocX = randi(256,1,8);
discLocY = randi(256,1,8);

figure
axis off

for i = 1:len
    % add frames
    
    frame = getframe;
    writeVideo(writer,frame);
end

end

